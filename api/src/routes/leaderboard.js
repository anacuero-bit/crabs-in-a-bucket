const { db } = require('../db');

async function routes(fastify) {
  fastify.get('/api/leaderboard', async (request, reply) => {
    const { harness, model } = request.query;

    // If filtering by harness or model, we need to join through submissions
    // to find users who have used that harness/model
    if (harness || model) {
      let sql = `
        SELECT DISTINCT u.*
        FROM users u
        JOIN submissions s ON s.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (harness) {
        sql += ' AND s.harness = ?';
        params.push(harness);
      }
      if (model) {
        sql += ' AND s.model = ?';
        params.push(model);
      }

      sql += ' ORDER BY u.rating DESC';

      const users = db.prepare(sql).all(...params);
      return users;
    }

    // Default: all users sorted by rating
    const users = db.prepare('SELECT * FROM users ORDER BY rating DESC').all();
    return users;
  });
}

module.exports = routes;
