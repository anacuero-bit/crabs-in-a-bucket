const { db } = require('../db');
const { scoreSubmission } = require('../utils/referee');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const unzipper = require('unzipper');
const { pipeline } = require('stream/promises');

const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage', 'submissions');

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

    const { challenge_id, user_id, model, harness, time_elapsed } = fields;

    if (!challenge_id || !user_id) {
      return reply.code(400).send({ error: 'challenge_id and user_id are required' });
    }

    // Verify challenge exists
    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challenge_id);
    if (!challenge) {
      return reply.code(404).send({ error: 'Challenge not found' });
    }

    // Verify user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
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
      // Clean up on failure
      fs.rmSync(folderPath, { recursive: true, force: true });
      return reply.code(400).send({ error: 'Failed to extract zip file: ' + err.message });
    }

    // Validate required files: index.html must exist (at top level or one directory down)
    let hasIndex = fs.existsSync(path.join(folderPath, 'index.html'));
    if (!hasIndex) {
      // Check one level deep (zip might have a wrapper directory)
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
      user_id,
      folderPath,
      score,
      JSON.stringify(breakdown),
      model || null,
      harness || null,
      time_elapsed || null
    );

    return reply.code(201).send({
      id: submissionId,
      ai_score: score,
      ai_breakdown: breakdown,
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
