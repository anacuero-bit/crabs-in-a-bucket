const { db } = require('../db');
const { scoreSubmission } = require('../utils/referee');
const { getUserByApiKey } = require('./auth');
const { matchWithHouseCrab } = require('../utils/housecrab');
const { moderateSubmission } = require('../utils/moderator');
const { notifyManuel } = require('../utils/notify');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const unzipper = require('unzipper');

const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage', 'submissions');

function autoMatch(submissionId, challengeId, userId) {
  // Find another unmatched submission for the same challenge, not by the same user
  const match = db.prepare(`
    SELECT id, user_id FROM submissions
    WHERE challenge_id = ?
      AND id != ?
      AND user_id != ?
      AND id NOT IN (SELECT submission_a_id FROM battles)
      AND id NOT IN (SELECT submission_b_id FROM battles)
    ORDER BY submitted_at ASC
    LIMIT 1
  `).get(challengeId, submissionId, userId);

  if (!match) return null;

  const battleId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO battles (id, challenge_id, submission_a_id, submission_b_id)
    VALUES (?, ?, ?, ?)
  `).run(battleId, challengeId, match.id, submissionId);

  return battleId;
}

async function routes(fastify) {
  // Submit a zip file + metadata
  fastify.post('/api/submissions', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const fields = {};
    for (const [key, fieldObj] of Object.entries(data.fields)) {
      fields[key] = fieldObj.value;
    }

    const { challenge_id, model, harness, time_elapsed } = fields;

    // Auth: try API key first, fall back to user_id field (backward compat)
    let user = getUserByApiKey(request);
    if (!user && fields.user_id) {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(fields.user_id);
    }

    if (!challenge_id) {
      return reply.code(400).send({ error: 'challenge_id is required' });
    }

    if (!user) {
      return reply.code(401).send({ error: 'Authentication required. Register with POST /api/register first.' });
    }

    // Verify challenge exists
    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challenge_id);
    if (!challenge) {
      return reply.code(404).send({ error: 'Challenge not found' });
    }

    const submissionId = crypto.randomUUID();
    const folderPath = path.join(STORAGE_DIR, submissionId);
    fs.mkdirSync(folderPath, { recursive: true });

    // Save zip then extract via the unzipper Node library (was shelling out
    // to /usr/bin/unzip; replaced 2026-05-05 to drop the hidden OS dep).
    const zipPath = path.join(folderPath, '_upload.zip');
    try {
      const chunks = [];
      for await (const chunk of data.file) {
        chunks.push(chunk);
      }
      fs.writeFileSync(zipPath, Buffer.concat(chunks));
      const directory = await unzipper.Open.file(zipPath);
      await directory.extract({ path: folderPath });
      fs.unlinkSync(zipPath);
    } catch (err) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      return reply.code(400).send({ error: 'Failed to extract zip file: ' + err.message });
    }

    // Validate required files: index.html must exist (at top level or one directory down)
    let hasIndex = fs.existsSync(path.join(folderPath, 'index.html'));
    if (!hasIndex) {
      const entries = fs.readdirSync(folderPath);
      for (const entry of entries) {
        const nested = path.join(folderPath, entry);
        if (fs.statSync(nested).isDirectory() && fs.existsSync(path.join(nested, 'index.html'))) {
          hasIndex = true;
          break;
        }
      }
    }

    if (!hasIndex) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      return reply.code(400).send({ error: 'Submission must contain an index.html file' });
    }

    // Pre-publish moderation. Fail-closed: anything other than an explicit
    // allow rejects the submission and surfaces the reason to the user.
    const moderation = await moderateSubmission({
      folderPath,
      challengePrompt: challenge.prompt,
    });
    if (!moderation.allowed) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      // Notify operator on every rejection so we can review false positives.
      notifyManuel(
        `<b>CrabFight submission rejected by moderator</b>\n` +
        `User: <code>${user.username}</code>\n` +
        `Challenge: <code>${challenge.name}</code>\n` +
        `Reason: ${moderation.reason}`
      ).catch(() => {});
      return reply.code(422).send({
        error: 'submission rejected by moderator',
        reason: moderation.reason,
        message: 'Your submission was flagged. If this looks wrong, contact the operator at /recover (use the same form to flag false positives).',
      });
    }

    // Score the submission
    const { score, breakdown } = await scoreSubmission({
      folderPath,
      challengePrompt: challenge.prompt,
      challengeCategory: challenge.category,
    });

    // Insert into database
    db.prepare(`
      INSERT INTO submissions (id, challenge_id, user_id, folder_path, ai_score, ai_breakdown, model, harness, time_elapsed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      submissionId,
      challenge_id,
      user.id,
      submissionId,
      score,
      JSON.stringify(breakdown),
      model || null,
      harness || null,
      time_elapsed || null
    );

    // Auto-match: try organic first, then house crab
    let battleId = autoMatch(submissionId, challenge_id, user.id);
    let matchError = null;

    if (!battleId) {
      // No organic opponent — trigger house crab
      try {
        battleId = await matchWithHouseCrab(submissionId, challenge_id, challenge.prompt, challenge.category);
      } catch (err) {
        matchError = err.message;
      }
      if (!battleId && !matchError) {
        matchError = 'house crab generation returned null (likely Anthropic outage, missing API key, or invalid generated HTML)';
      }
    }

    const response = {
      id: submissionId,
      ai_score: score,
      ai_breakdown: breakdown,
    };

    if (battleId) {
      response.battle_id = battleId;
      response.message = 'Matched! Battle created.';
    } else {
      // Logged with submission id so operators can correlate against /api/submissions/:id/retry-match
      fastify.log.error({ submission_id: submissionId, matchError }, 'submission unmatched');
      response.match_status = 'pending';
      response.match_error = matchError;
      response.message = 'Submitted but no opponent matched. The submission is saved — you can retry matchmaking from the result screen, or it will be picked up by the next pending-match sweep.';
      response.retry_url = `/api/submissions/${submissionId}/retry-match`;
    }

    return reply.code(201).send(response);
  });

  // Retry matchmaking for an unmatched submission (auth: must own the submission).
  fastify.post('/api/submissions/:id/retry-match', async (request, reply) => {
    const user = getUserByApiKey(request);
    if (!user) {
      return reply.code(401).send({ error: 'Authentication required.' });
    }

    const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(request.params.id);
    if (!submission) {
      return reply.code(404).send({ error: 'Submission not found' });
    }
    if (submission.user_id !== user.id) {
      return reply.code(403).send({ error: 'Not your submission' });
    }

    // Already in a battle?
    const existing = db.prepare(`
      SELECT id FROM battles
      WHERE submission_a_id = ? OR submission_b_id = ?
    `).get(submission.id, submission.id);
    if (existing) {
      return { battle_id: existing.id, message: 'Already matched.' };
    }

    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(submission.challenge_id);
    if (!challenge) {
      return reply.code(500).send({ error: 'Challenge missing for submission' });
    }

    let battleId = autoMatch(submission.id, submission.challenge_id, submission.user_id);
    let matchError = null;
    if (!battleId) {
      try {
        battleId = await matchWithHouseCrab(submission.id, submission.challenge_id, challenge.prompt, challenge.category);
      } catch (err) {
        matchError = err.message;
      }
      if (!battleId && !matchError) {
        matchError = 'house crab generation returned null (likely Anthropic outage, missing API key, or invalid generated HTML)';
      }
    }

    if (battleId) {
      return { battle_id: battleId, message: 'Matched.' };
    }
    return reply.code(503).send({
      error: 'still no match',
      match_error: matchError,
      message: 'Matchmaking failed again. The backend is likely degraded — try again in a few minutes or contact the operator.',
    });
  });

  // Get submission details
  fastify.get('/api/submissions/:id', async (request, reply) => {
    const submission = db.prepare(`
      SELECT s.*, u.username, c.name as challenge_name
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN challenges c ON s.challenge_id = c.id
      WHERE s.id = ?
    `).get(request.params.id);

    if (!submission) {
      return reply.code(404).send({ error: 'Submission not found' });
    }

    return {
      ...submission,
      ai_breakdown: submission.ai_breakdown ? JSON.parse(submission.ai_breakdown) : null,
    };
  });
}

module.exports = routes;
