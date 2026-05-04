// Operator sweep: find every submission that has no battle yet (excluding
// HouseCrab's own submissions, which are always paired with a player) and
// re-attempt matchmaking. Run on the server when matchmaking has been failing
// (e.g. Anthropic outage now resolved).
//
// Usage: node scripts/retry-pending-matches.js
//
// Idempotent — already-matched submissions are skipped.

const { db } = require('../src/db');
const { matchWithHouseCrab } = require('../src/utils/housecrab');
const crypto = require('crypto');

function autoMatch(submissionId, challengeId, userId) {
  const match = db.prepare(`
    SELECT id FROM submissions
    WHERE challenge_id = ?
      AND id != ?
      AND user_id != ?
      AND id NOT IN (SELECT submission_a_id FROM battles)
      AND id NOT IN (SELECT submission_b_id FROM battles)
    ORDER BY submitted_at ASC
    LIMIT 1
  `).get(challengeId, submissionId, userId);
  if (!match) return null;

  const battleId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO battles (id, challenge_id, submission_a_id, submission_b_id)
    VALUES (?, ?, ?, ?)
  `).run(battleId, challengeId, match.id, submissionId);
  return battleId;
}

async function main() {
  const houseCrab = db.prepare("SELECT id FROM users WHERE username = 'HouseCrab'").get();
  const houseCrabId = houseCrab ? houseCrab.id : null;

  const pending = db.prepare(`
    SELECT s.*, c.prompt as challenge_prompt, c.category as challenge_category
    FROM submissions s
    JOIN challenges c ON c.id = s.challenge_id
    WHERE s.id NOT IN (SELECT submission_a_id FROM battles)
      AND s.id NOT IN (SELECT submission_b_id FROM battles)
      ${houseCrabId ? 'AND s.user_id != ?' : ''}
    ORDER BY s.submitted_at ASC
  `).all(...(houseCrabId ? [houseCrabId] : []));

  if (pending.length === 0) {
    console.log('No pending submissions.');
    return;
  }

  console.log(`Found ${pending.length} pending submission(s). Retrying matchmaking...`);
  let matched = 0;
  let failed = 0;

  for (const sub of pending) {
    let battleId = autoMatch(sub.id, sub.challenge_id, sub.user_id);
    let err = null;
    if (!battleId) {
      try {
        battleId = await matchWithHouseCrab(sub.id, sub.challenge_id, sub.challenge_prompt, sub.challenge_category);
      } catch (e) {
        err = e.message;
      }
    }
    if (battleId) {
      console.log(`  ✓ ${sub.id.slice(0, 8)}…  →  battle ${battleId.slice(0, 8)}…`);
      matched++;
    } else {
      console.log(`  ✗ ${sub.id.slice(0, 8)}…  still unmatched${err ? ' — ' + err : ''}`);
      failed++;
    }
  }

  console.log(`\nMatched: ${matched}. Still pending: ${failed}.`);
}

main().catch(err => { console.error(err); process.exit(1); });
