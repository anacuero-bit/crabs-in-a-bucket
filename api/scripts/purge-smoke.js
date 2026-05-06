// Purge smoke-test artifacts from the DB and storage.
// Smoke-test runs (scripts/smoke-test.sh) register users with username
// `smoketest-<unix-ts>`. Without cleanup, every cutover leaves a row in the
// public feed paired against a real house-crab submission. This script
// deletes those users and everything that hangs off them.
//
// Idempotent. Run after smoke-test passes, or on a cron.

const fs = require('fs');
const path = require('path');
const { db } = require('../src/db');

const STORAGE_DIR = path.join(__dirname, '..', 'storage', 'submissions');

const smokeUsers = db.prepare(
  "SELECT id, username FROM users WHERE username LIKE 'smoketest-%'"
).all();

if (smokeUsers.length === 0) {
  console.log('No smoke-test users found. Nothing to purge.');
  process.exit(0);
}

const userIds = smokeUsers.map(u => u.id);
const userIdPlaceholders = userIds.map(() => '?').join(',');

const submissions = db.prepare(
  `SELECT id, folder_path FROM submissions WHERE user_id IN (${userIdPlaceholders})`
).all(...userIds);

const submissionIds = submissions.map(s => s.id);
const subIdPlaceholders = submissionIds.map(() => '?').join(',') || 'NULL';

const battlesToDelete = submissionIds.length > 0
  ? db.prepare(
      `SELECT id FROM battles
       WHERE submission_a_id IN (${subIdPlaceholders})
          OR submission_b_id IN (${subIdPlaceholders})`
    ).all(...submissionIds, ...submissionIds)
  : [];

const battleIds = battlesToDelete.map(b => b.id);
const battleIdPlaceholders = battleIds.map(() => '?').join(',') || 'NULL';

const txn = db.transaction(() => {
  if (battleIds.length > 0) {
    db.prepare(`DELETE FROM votes WHERE battle_id IN (${battleIdPlaceholders})`).run(...battleIds);
    db.prepare(`DELETE FROM battles WHERE id IN (${battleIdPlaceholders})`).run(...battleIds);
  }
  if (submissionIds.length > 0) {
    db.prepare(`DELETE FROM submissions WHERE id IN (${subIdPlaceholders})`).run(...submissionIds);
  }
  db.prepare(`DELETE FROM fight_codes WHERE user_id IN (${userIdPlaceholders})`).run(...userIds);
  db.prepare(`DELETE FROM users WHERE id IN (${userIdPlaceholders})`).run(...userIds);
});

txn();

let foldersRemoved = 0;
for (const sub of submissions) {
  const folder = path.join(STORAGE_DIR, sub.id);
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true, force: true });
    foldersRemoved++;
  }
}

console.log(`Purged ${smokeUsers.length} smoke user(s), ${submissions.length} submission(s), ${battleIds.length} battle(s), ${foldersRemoved} storage folder(s).`);
