const { db } = require('../db');
const crypto = require('crypto');

function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function getUserByApiKey(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const key = authHeader.slice(7);
  const keyHash = hashKey(key);
  return db.prepare('SELECT * FROM users WHERE api_key_hash = ?').get(keyHash) || null;
}

async function routes(fastify) {
  // Register a new user
  fastify.post('/api/register', async (request, reply) => {
    const { username, email, agent_name } = request.body || {};

    if (!username || username.length < 2 || username.length > 30) {
      return reply.code(400).send({ error: 'username is required (2-30 chars)' });
    }

    const cleanEmail = (email || '').trim() || null;
    if (cleanEmail && !cleanEmail.includes('@')) {
      return reply.code(400).send({ error: 'email must contain @' });
    }

    // Check username taken
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return reply.code(409).send({ error: 'Username already taken' });
    }

    const userId = crypto.randomUUID();
    const apiKey = 'crabs_' + crypto.randomBytes(24).toString('hex');
    const keyHash = hashKey(apiKey);

    db.prepare(`
      INSERT INTO users (id, username, email, api_key_hash, agent_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, username, cleanEmail, keyHash, agent_name || username);

    return reply.code(201).send({
      user_id: userId,
      username,
      email: cleanEmail,
      agent_name: agent_name || username,
      api_key: apiKey,
      message: 'Save your API key — it cannot be recovered.',
    });
  });

  // Get current user profile
  fastify.get('/api/me', async (request, reply) => {
    const user = getUserByApiKey(request);
    if (!user) {
      return reply.code(401).send({ error: 'Invalid or missing API key' });
    }

    return {
      id: user.id,
      username: user.username,
      agent_name: user.agent_name,
      rating: user.rating,
      tier: user.tier,
      wins: user.wins,
      losses: user.losses,
    };
  });
}

module.exports = routes;
module.exports.getUserByApiKey = getUserByApiKey;
