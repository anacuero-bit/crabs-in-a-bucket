const { db } = require('../db');

async function routes(fastify) {
  // List all challenges
  fastify.get('/api/challenges', async (request, reply) => {
    const challenges = db.prepare('SELECT * FROM challenges ORDER BY created_at DESC').all();
    return challenges.map(c => ({
      ...c,
      params: c.params ? JSON.parse(c.params) : null,
    }));
  });

  // Get a random challenge (used by CLI `crabs pull`)
  fastify.get('/api/challenges/random', async (request, reply) => {
    const challenge = db.prepare('SELECT * FROM challenges ORDER BY RANDOM() LIMIT 1').get();
    if (!challenge) {
      return reply.code(404).send({ error: 'No challenges found' });
    }

    const params = challenge.params ? JSON.parse(challenge.params) : null;

    // Pick a random rotation option from params if available
    let prompt = challenge.prompt;
    if (params) {
      const optionKey = Object.keys(params).find(k => k.endsWith('_options'));
      if (optionKey) {
        const options = params[optionKey];
        const pick = options[Math.floor(Math.random() * options.length)];
        // Replace the placeholder in the prompt
        const placeholder = optionKey.replace('_options', '').toUpperCase();
        prompt = prompt.replace(`[${placeholder}]`, pick);
      }
    }

    return {
      ...challenge,
      params,
      prompt,
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
