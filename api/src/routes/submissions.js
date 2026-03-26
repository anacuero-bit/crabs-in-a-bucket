const { db } = require('../db');
const { scoreSubmission } = require('../utils/referee');
const { getUserByApiKey } = require('./auth');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const unzipper = require('unzipper');
const { pipeline } = require('stream/promises');

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

    // Extract zip to folder
    try {
      await pipeline(
        data.file,
        unzipper.Extract({ path: folderPath })
      );
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

    // Auto-match
    const battleId = autoMatch(submissionId, challenge_id, user.id);

    const response = {
      id: submissionId,
      ai_score: score,
      ai_breakdown: breakdown,
    };

    if (battleId) {
      response.battle_id = battleId;
      response.message = 'Matched! Battle created.';
    } else {
      response.message = 'Submitted. Waiting for an opponent...';
    }

    return reply.code(201).send(response);
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
