// Fight-start endpoint. Issues a server-tracked fight_code per pull.
// Submissions consume the code; deadline is enforced server-side.

const { db } = require('../db');
const { GENERIC_INSTRUCTIONS } = require('./challenges');
const crypto = require('crypto');

function pickChallenge(challengeId) {
  if (challengeId) {
    return db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId);
  }
  return db.prepare('SELECT * FROM challenges ORDER BY RANDOM() LIMIT 1').get();
}

function renderPrompt(challenge) {
  const params = challenge.params ? JSON.parse(challenge.params) : null;
  let prompt = challenge.prompt;
  if (params) {
    const optionKey = Object.keys(params).find(k => k.endsWith('_options'));
    if (optionKey) {
      const options = params[optionKey];
      const pick = options[Math.floor(Math.random() * options.length)];
      const placeholder = optionKey.replace('_options', '').toUpperCase();
      prompt = prompt.replace(`[${placeholder}]`, pick);
    }
  }
  return prompt;
}

async function routes(fastify) {
  // POST /api/fight/start — issue a fight code + return everything the client
  // needs to render the challenge UI. Replaces the client-side fight_code
  // generation in the previous flow.
  fastify.post('/api/fight/start', async (request, reply) => {
    const { challenge_id } = request.body || {};

    const challenge = pickChallenge(challenge_id);
    if (!challenge) {
      return reply.code(404).send({ error: 'Challenge not found' });
    }

    const renderedPromptCore = renderPrompt(challenge);
    const fightCode = 'CF-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const issuedAt = new Date();
    const deadline = new Date(issuedAt.getTime() + challenge.time_minutes * 60 * 1000);
    const fullPrompt = `${GENERIC_INSTRUCTIONS}\n\n${renderedPromptCore}\n\n---\nFIGHT CODE: ${fightCode}\nTIME LIMIT: ${challenge.time_minutes} minutes`;

    db.prepare(`
      INSERT INTO fight_codes (code, challenge_id, issued_at, deadline, rendered_prompt)
      VALUES (?, ?, ?, ?, ?)
    `).run(fightCode, challenge.id, issuedAt.toISOString(), deadline.toISOString(), fullPrompt);

    return {
      fight_code: fightCode,
      challenge_id: challenge.id,
      name: challenge.name,
      category: challenge.category,
      tier: challenge.tier,
      time_minutes: challenge.time_minutes,
      prompt: fullPrompt,
      issued_at: issuedAt.toISOString(),
      deadline: deadline.toISOString(),
    };
  });
}

module.exports = routes;
