const { db } = require('../db');
const path = require('path');
const fs = require('fs');

const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage', 'submissions');

// MIME type map for common web files
const MIME_TYPES = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

async function routes(fastify) {
  // Serve submission files: /api/files/submissions/:id/*
  fastify.get('/api/files/submissions/:id/*', async (request, reply) => {
    const submissionId = request.params.id;
    const filePath = request.params['*'] || 'index.html';

    // Verify the submission exists
    const submission = db.prepare('SELECT id FROM submissions WHERE id = ?').get(submissionId);
    if (!submission) {
      return reply.code(404).send({ error: 'Submission not found' });
    }

    // Resolve file path and prevent directory traversal
    const resolved = path.resolve(STORAGE_DIR, submissionId, filePath);
    const submissionDir = path.resolve(STORAGE_DIR, submissionId);

    if (!resolved.startsWith(submissionDir)) {
      return reply.code(403).send({ error: 'Access denied' });
    }

    if (!fs.existsSync(resolved)) {
      return reply.code(404).send({ error: 'File not found' });
    }

    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const stream = fs.createReadStream(resolved);
    return reply.type(contentType).send(stream);
  });
}

module.exports = routes;
