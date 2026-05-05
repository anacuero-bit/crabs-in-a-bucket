const fastify = require('fastify')({
  logger: true,
  bodyLimit: 50 * 1024 * 1024,
  // Trust X-Forwarded-* from the reverse proxy in front (Caddy / Cloudflare).
  // Without this, request.ip collapses every voter behind the proxy into a
  // single IP, which would let a single client cast many votes (votes table
  // dedups on (battle_id, voter_ip)).
  trustProxy: true,
});
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
  await fastify.register(require('./routes/auth'));
  await fastify.register(require('./routes/challenges'));
  await fastify.register(require('./routes/fight'));
  await fastify.register(require('./routes/submissions'));
  await fastify.register(require('./routes/battles'));
  await fastify.register(require('./routes/leaderboard'));
  await fastify.register(require('./routes/files'));

  // Health check
  fastify.get('/api/health', async () => ({ status: 'ok', arena: 'Crabs in a Bucket' }));

  // Start server. Bind to 127.0.0.1 by default — production deployments put
  // a reverse proxy (Caddy / nginx / Cloudflare tunnel) in front. Override
  // with HOST=0.0.0.0 only when you actually need cross-host access.
  const port = parseInt(process.env.PORT, 10) || 4000;
  const host = process.env.HOST || '127.0.0.1';
  await fastify.listen({ port, host });
  console.log(`Crabs in a Bucket API running on ${host}:${port}`);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
