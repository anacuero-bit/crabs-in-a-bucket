const { db } = require('../db');
const { calculateRatings, getTier } = require('../utils/glicko');
const crypto = require('crypto');

// Minimum vote threshold before a battle is resolved
const VOTE_THRESHOLD = 5;

async function routes(fastify) {
  // List battles with optional filters
  fastify.get('/api/battles', async (request, reply) => {
    const { category, sort } = request.query;

    let sql = `
      SELECT
        b.*,
        c.name as challenge_name,
        c.category,
        c.tier,
        c.time_minutes,
        c.prompt as challenge_prompt,
        sa.user_id as user_a_id,
        sb.user_id as user_b_id,
        ua.username as username_a,
        ub.username as username_b,
        sa.ai_score as score_a,
        sb.ai_score as score_b,
        sa.ai_breakdown as breakdown_a,
        sb.ai_breakdown as breakdown_b,
        sa.model as model_a,
        sb.model as model_b,
        sa.harness as harness_a,
        sb.harness as harness_b,
        sa.time_elapsed as time_a,
        sb.time_elapsed as time_b
      FROM battles b
      JOIN challenges c ON b.challenge_id = c.id
      JOIN submissions sa ON b.submission_a_id = sa.id
      JOIN submissions sb ON b.submission_b_id = sb.id
      JOIN users ua ON sa.user_id = ua.id
      JOIN users ub ON sb.user_id = ub.id
    `;

    const params = [];
    if (category) {
      sql += ' WHERE c.category = ?';
      params.push(category);
    }

    if (sort === 'recent') {
      sql += ' ORDER BY b.created_at DESC';
    } else if (sort === 'votes') {
      sql += ' ORDER BY (b.votes_a + b.votes_b) DESC';
    } else {
      sql += ' ORDER BY b.created_at DESC';
    }

    const rows = db.prepare(sql).all(...params);
    return rows.map(r => ({
      id: r.id,
      challenge_id: r.challenge_id,
      votes_a: r.votes_a,
      votes_b: r.votes_b,
      status: r.status,
      created_at: r.created_at,
      challenge: { name: r.challenge_name, category: r.category, tier: r.tier, time_minutes: r.time_minutes, prompt: r.challenge_prompt },
      submission_a: { id: r.submission_a_id, ai_score: r.score_a, ai_breakdown: r.breakdown_a ? JSON.parse(r.breakdown_a) : null, model: r.model_a, harness: r.harness_a, time_elapsed: r.time_a, username: r.username_a },
      submission_b: { id: r.submission_b_id, ai_score: r.score_b, ai_breakdown: r.breakdown_b ? JSON.parse(r.breakdown_b) : null, model: r.model_b, harness: r.harness_b, time_elapsed: r.time_b, username: r.username_b },
    }));
  });

  // Get full battle detail
  fastify.get('/api/battles/:id', async (request, reply) => {
    const battle = db.prepare(`
      SELECT
        b.*,
        c.name as challenge_name,
        c.category,
        c.tier as challenge_tier,
        c.time_minutes,
        c.prompt as challenge_prompt,
        sa.id as sub_a_id, sa.folder_path as folder_a, sa.ai_score as score_a,
        sa.ai_breakdown as breakdown_a, sa.model as model_a, sa.harness as harness_a,
        sa.time_elapsed as time_a,
        sb.id as sub_b_id, sb.folder_path as folder_b, sb.ai_score as score_b,
        sb.ai_breakdown as breakdown_b, sb.model as model_b, sb.harness as harness_b,
        sb.time_elapsed as time_b,
        ua.username as username_a, ua.rating as rating_a, ua.tier as tier_a,
        ub.username as username_b, ub.rating as rating_b, ub.tier as tier_b
      FROM battles b
      JOIN challenges c ON b.challenge_id = c.id
      JOIN submissions sa ON b.submission_a_id = sa.id
      JOIN submissions sb ON b.submission_b_id = sb.id
      JOIN users ua ON sa.user_id = ua.id
      JOIN users ub ON sb.user_id = ub.id
      WHERE b.id = ?
    `).get(request.params.id);

    if (!battle) {
      return reply.code(404).send({ error: 'Battle not found' });
    }

    return {
      id: battle.id,
      challenge_id: battle.challenge_id,
      votes_a: battle.votes_a,
      votes_b: battle.votes_b,
      status: battle.status,
      created_at: battle.created_at,
      challenge: {
        name: battle.challenge_name,
        category: battle.category,
        tier: battle.challenge_tier,
        time_minutes: battle.time_minutes,
        prompt: battle.challenge_prompt,
      },
      submission_a: {
        id: battle.sub_a_id,
        ai_score: battle.score_a,
        ai_breakdown: battle.breakdown_a ? JSON.parse(battle.breakdown_a) : null,
        model: battle.model_a,
        harness: battle.harness_a,
        folder_path: battle.folder_a,
        time_elapsed: battle.time_a,
        username: battle.username_a,
        rating: battle.rating_a,
        tier: battle.tier_a,
      },
      submission_b: {
        id: battle.sub_b_id,
        ai_score: battle.score_b,
        ai_breakdown: battle.breakdown_b ? JSON.parse(battle.breakdown_b) : null,
        model: battle.model_b,
        harness: battle.harness_b,
        folder_path: battle.folder_b,
        time_elapsed: battle.time_b,
        username: battle.username_b,
        rating: battle.rating_b,
        tier: battle.tier_b,
      },
    };
  });

  // Create a battle (admin)
  fastify.post('/api/battles', async (request, reply) => {
    const { submission_a_id, submission_b_id } = request.body || {};

    if (!submission_a_id || !submission_b_id) {
      return reply.code(400).send({ error: 'submission_a_id and submission_b_id are required' });
    }

    const subA = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submission_a_id);
    const subB = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submission_b_id);

    if (!subA || !subB) {
      return reply.code(404).send({ error: 'One or both submissions not found' });
    }

    if (subA.challenge_id !== subB.challenge_id) {
      return reply.code(400).send({ error: 'Both submissions must be for the same challenge' });
    }

    const battleId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO battles (id, challenge_id, submission_a_id, submission_b_id)
      VALUES (?, ?, ?, ?)
    `).run(battleId, subA.challenge_id, submission_a_id, submission_b_id);

    return reply.code(201).send({
      id: battleId,
      challenge_id: subA.challenge_id,
      submission_a_id,
      submission_b_id,
    });
  });

  // Cast a vote
  fastify.post('/api/battles/:id/vote', async (request, reply) => {
    const battleId = request.params.id;
    const { voted_for } = request.body || {};

    if (!voted_for || !['A', 'B'].includes(voted_for)) {
      return reply.code(400).send({ error: 'voted_for must be "A" or "B"' });
    }

    const battle = db.prepare('SELECT * FROM battles WHERE id = ?').get(battleId);
    if (!battle) {
      return reply.code(404).send({ error: 'Battle not found' });
    }

    if (battle.status !== 'active') {
      return reply.code(400).send({ error: 'Battle is no longer active' });
    }

    const voterIp = request.ip || request.headers['x-forwarded-for'] || 'unknown';

    // Check for duplicate vote
    const existing = db.prepare('SELECT id FROM votes WHERE battle_id = ? AND voter_ip = ?').get(battleId, voterIp);
    if (existing) {
      return reply.code(409).send({ error: 'You have already voted on this battle' });
    }

    const voteId = crypto.randomUUID();

    const txn = db.transaction(() => {
      db.prepare('INSERT INTO votes (id, battle_id, voter_ip, voted_for) VALUES (?, ?, ?, ?)')
        .run(voteId, battleId, voterIp, voted_for);

      const column = voted_for === 'A' ? 'votes_a' : 'votes_b';
      db.prepare(`UPDATE battles SET ${column} = ${column} + 1 WHERE id = ?`).run(battleId);

      // Check if battle should be resolved
      const updated = db.prepare('SELECT * FROM battles WHERE id = ?').get(battleId);
      const totalVotes = updated.votes_a + updated.votes_b;

      if (totalVotes >= VOTE_THRESHOLD) {
        // Determine winner and update ratings
        let scoreA;
        if (updated.votes_a > updated.votes_b) {
          scoreA = 1; // A wins
        } else if (updated.votes_b > updated.votes_a) {
          scoreA = 0; // B wins
        } else {
          scoreA = 0.5; // draw
        }

        // Get player data
        const subA = db.prepare('SELECT user_id FROM submissions WHERE id = ?').get(updated.submission_a_id);
        const subB = db.prepare('SELECT user_id FROM submissions WHERE id = ?').get(updated.submission_b_id);
        const userA = db.prepare('SELECT * FROM users WHERE id = ?').get(subA.user_id);
        const userB = db.prepare('SELECT * FROM users WHERE id = ?').get(subB.user_id);

        const result = calculateRatings(
          { rating: userA.rating, rd: userA.rating_deviation },
          { rating: userB.rating, rd: userB.rating_deviation },
          scoreA
        );

        // Update user A
        db.prepare(`
          UPDATE users SET rating = ?, rating_deviation = ?, tier = ?,
            wins = wins + ?, losses = losses + ?
          WHERE id = ?
        `).run(
          result.a.rating, result.a.rd, getTier(result.a.rating),
          scoreA >= 0.5 ? 1 : 0, scoreA < 0.5 ? 1 : 0,
          userA.id
        );

        // Update user B
        db.prepare(`
          UPDATE users SET rating = ?, rating_deviation = ?, tier = ?,
            wins = wins + ?, losses = losses + ?
          WHERE id = ?
        `).run(
          result.b.rating, result.b.rd, getTier(result.b.rating),
          scoreA <= 0.5 ? 1 : 0, scoreA > 0.5 ? 1 : 0,
          userB.id
        );

        db.prepare("UPDATE battles SET status = 'resolved' WHERE id = ?").run(battleId);
      }
    });

    txn();

    const finalBattle = db.prepare('SELECT votes_a, votes_b, status FROM battles WHERE id = ?').get(battleId);

    return {
      vote_id: voteId,
      votes_a: finalBattle.votes_a,
      votes_b: finalBattle.votes_b,
      status: finalBattle.status,
    };
  });
}

module.exports = routes;
