const { db } = require('../db');
const crypto = require('crypto');

const GENERIC_INSTRUCTIONS = `
SUBMISSION RULES:
- Output MUST be a single self-contained index.html file
- All CSS and JavaScript must be inline (no external files except CDN libraries)
- Must work standalone in a browser — no build step, no server
- Include a src/ folder with any supporting code or notes
- The result must be visually polished — not raw HTML
- Mobile-friendly where applicable
- Must be functional — not a mockup or placeholder

JUDGING CRITERIA:
- Functionality (does it work? does it meet requirements?)
- Design & polish (visual quality, UX, attention to detail)
- Completeness (did it cover all requirements + bonus?)
- Code quality (clean, readable, well-structured)
`.trim();

async function routes(fastify) {
  // List all challenges
  fastify.get('/api/challenges', async (request, reply) => {
    const challenges = db.prepare('SELECT * FROM challenges ORDER BY created_at DESC').all();
    return challenges.map(c => ({
      ...c,
      params: c.params ? JSON.parse(c.params) : null,
    }));
  });

  // Get a random challenge with unique fight code
  fastify.get('/api/challenges/random', async (request, reply) => {
    const challenge = db.prepare('SELECT * FROM challenges ORDER BY RANDOM() LIMIT 1').get();
    if (!challenge) {
      return reply.code(404).send({ error: 'No challenges found' });
    }

    const params = challenge.params ? JSON.parse(challenge.params) : null;

    // Pick a random rotation option
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

    // Generate unique fight code
    const fightCode = 'CF-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const issuedAt = new Date().toISOString();
    const deadline = new Date(Date.now() + challenge.time_minutes * 60 * 1000).toISOString();

    // Full prompt with generic instructions
    const fullPrompt = `${prompt}\n\n---\n\n${GENERIC_INSTRUCTIONS}\n\nFIGHT CODE: ${fightCode}\nDEADLINE: ${challenge.time_minutes} minutes from pull\nTIME LIMIT: ${challenge.time_minutes} minutes`;

    return {
      ...challenge,
      params,
      prompt: fullPrompt,
      fight_code: fightCode,
      issued_at: issuedAt,
      deadline,
    };
  });

  // Get specific challenge
  fastify.get('/api/challenges/:id', async (request, reply) => {
    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(request.params.id);
    if (!challenge) {
      return reply.code(404).send({ error: 'Challenge not found' });
    }
    return {
      ...challenge,
      params: challenge.params ? JSON.parse(challenge.params) : null,
    };
  });
}

module.exports = routes;
