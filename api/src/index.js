const fastify = require('fastify')({ logger: true, bodyLimit: 50 * 1024 * 1024 });
const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');
const path = require('path');
const fs = require('fs');

// Ensure storage directory exists
const storageDir = path.join(__dirname, '..', 'storage', 'submissions');
fs.mkdirSync(storageDir, { recursive: true });

async function start() {
  // Register plugins
  await fastify.register(cors, { origin: true });
  await fastify.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });

  // Initialize database (create tables + seed)
  const { init } = require('./db');
  init();

  // Register routes
  await fastify.register(require('./routes/challenges'));
  await fastify.register(require('./routes/submissions'));
  await fastify.register(require('./routes/battles'));
  await fastify.register(require('./routes/leaderboard'));
  await fastify.register(require('./routes/files'));

  // Health check
  fastify.get('/api/health', async () => ({ status: 'ok', arena: 'Crabs in a Bucket' }));

  // Start server
  const port = parseInt(process.env.PORT, 10) || 4000;
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`Crabs in a Bucket API running on port ${port}`);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
