/**
 * seed-battles.js
 *
 * Ingests the seed battle content from /seed into the running API's
 * SQLite database and storage directory.
 *
 * Usage:  node scripts/seed-battles.js
 * Run from the api/ directory.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ── Paths ──────────────────────────────────────────────────────────────────
const API_ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(API_ROOT, 'data', 'arena.db');
const STORAGE_DIR = path.join(API_ROOT, 'storage', 'submissions');
const SEED_ROOT = path.resolve(API_ROOT, '..', 'seed');

// ── Pre-flight checks ─────────────────────────────────────────────────────
if (!fs.existsSync(DB_PATH)) {
  console.error('ERROR: Database not found at', DB_PATH);
  console.error('Start the API server first so the database is created, then re-run this script.');
  process.exit(1);
}

console.log('Opening database at', DB_PATH);
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Battle definitions ─────────────────────────────────────────────────────
const BATTLES = [
  { dir: 'battle-001-breakout', challengeName: 'The Arcade' },
  { dir: 'battle-002-json',     challengeName: 'The Quick Draw' },
  { dir: 'battle-003-typing',   challengeName: 'The Arcade' },
  { dir: 'battle-004-colors',   challengeName: 'The Quick Draw' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

/** Recursively copy a directory */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** Random integer in [min, max] inclusive */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate an AI score breakdown. If `boost` is true, scores skew higher. */
function makeScores(boost) {
  const base = boost ? 5 : 0; // crab-b gets a slight bump
  const functionality = randInt(70 + base, 95);
  const design        = randInt(70 + base, 95);
  const code_quality  = randInt(70 + base, 95);
  const completeness  = randInt(70 + base, 95);
  const overall       = Math.round((functionality + design + code_quality + completeness) / 4);
  return { score: overall, breakdown: { functionality, design, code_quality, completeness, overall } };
}

// ── Fetch existing seed data ───────────────────────────────────────────────

// Look up test users
const users = db.prepare('SELECT id, username FROM users WHERE username IN (?, ?)').all('CrabMaster', 'ShellShock');
if (users.length < 2) {
  console.error('ERROR: Could not find test users CrabMaster and ShellShock in the database.');
  console.error('Make sure the API server has been started at least once so the seed data is created.');
  process.exit(1);
}
const userMap = {};
for (const u of users) userMap[u.username] = u.id;
console.log(`Found users: ${users.map(u => `${u.username} (${u.id})`).join(', ')}`);

// Look up challenges by name
const challenges = db.prepare('SELECT id, name FROM challenges').all();
const challengeMap = {};
for (const c of challenges) challengeMap[c.name] = c.id;
console.log(`Found challenges: ${challenges.map(c => c.name).join(', ')}`);

for (const needed of ['The Arcade', 'The Quick Draw']) {
  if (!challengeMap[needed]) {
    console.error(`ERROR: Challenge "${needed}" not found in database.`);
    process.exit(1);
  }
}

// ── Prepared statements ────────────────────────────────────────────────────
const insertSubmission = db.prepare(`
  INSERT INTO submissions (id, challenge_id, user_id, folder_path, ai_score, ai_breakdown, model, harness, time_elapsed, submitted_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertBattle = db.prepare(`
  INSERT INTO battles (id, challenge_id, submission_a_id, submission_b_id, votes_a, votes_b, status)
  VALUES (?, ?, ?, ?, ?, ?, 'active')
`);

const insertVote = db.prepare(`
  INSERT INTO votes (id, battle_id, voter_ip, voted_for)
  VALUES (?, ?, ?, ?)
`);

// ── Seed each battle ───────────────────────────────────────────────────────
let firstSubmissionId = null;

const seedAll = db.transaction(() => {
  for (let i = 0; i < BATTLES.length; i++) {
    const battle = BATTLES[i];
    const battleDir = path.join(SEED_ROOT, battle.dir);
    const challengeId = challengeMap[battle.challengeName];

    console.log(`\n── ${battle.dir} → "${battle.challengeName}" ──`);

    // Alternate who is crab-a vs crab-b
    // Even battles: CrabMaster=a, ShellShock=b.  Odd: reversed.
    const userA = i % 2 === 0 ? userMap['CrabMaster'] : userMap['ShellShock'];
    const userB = i % 2 === 0 ? userMap['ShellShock'] : userMap['CrabMaster'];

    // Read crabs.json from each side
    const crabAMeta = JSON.parse(fs.readFileSync(path.join(battleDir, 'crab-a', 'crabs.json'), 'utf-8'));
    const crabBMeta = JSON.parse(fs.readFileSync(path.join(battleDir, 'crab-b', 'crabs.json'), 'utf-8'));

    // Generate UUIDs for submissions
    const subIdA = crypto.randomUUID();
    const subIdB = crypto.randomUUID();
    if (!firstSubmissionId) firstSubmissionId = subIdA;

    // Copy folders into storage
    const destA = path.join(STORAGE_DIR, subIdA);
    const destB = path.join(STORAGE_DIR, subIdB);
    console.log(`  Copying crab-a → ${subIdA}`);
    copyDirSync(path.join(battleDir, 'crab-a'), destA);
    console.log(`  Copying crab-b → ${subIdB}`);
    copyDirSync(path.join(battleDir, 'crab-b'), destB);

    // Generate AI scores (crab-b boosted)
    const scoresA = makeScores(false);
    const scoresB = makeScores(true);

    // Insert submissions
    insertSubmission.run(
      subIdA, challengeId, userA, subIdA,
      scoresA.score, JSON.stringify(scoresA.breakdown),
      crabAMeta.model, crabAMeta.harness, crabAMeta.time_elapsed,
      crabAMeta.submitted_at
    );
    console.log(`  Submission A: score=${scoresA.score} model=${crabAMeta.model} harness=${crabAMeta.harness} time=${crabAMeta.time_elapsed}`);

    insertSubmission.run(
      subIdB, challengeId, userB, subIdB,
      scoresB.score, JSON.stringify(scoresB.breakdown),
      crabBMeta.model, crabBMeta.harness, crabBMeta.time_elapsed,
      crabBMeta.submitted_at
    );
    console.log(`  Submission B: score=${scoresB.score} model=${crabBMeta.model} harness=${crabBMeta.harness} time=${crabBMeta.time_elapsed}`);

    // Create battle record with mock vote totals
    const battleId = crypto.randomUUID();
    const votesA = randInt(100, 800);
    const votesB = randInt(100, 800);
    insertBattle.run(battleId, challengeId, subIdA, subIdB, votesA, votesB);
    console.log(`  Battle ${battleId.slice(0, 8)}… votes: A=${votesA} B=${votesB}`);

    // Insert individual mock votes to back up the totals
    // We'll insert a representative sample (up to 50 each side) to populate the votes table
    const sampleA = Math.min(votesA, 50);
    const sampleB = Math.min(votesB, 50);
    for (let v = 0; v < sampleA; v++) {
      insertVote.run(crypto.randomUUID(), battleId, `seed-a-${i}-${v}.mock.ip`, 'A');
    }
    for (let v = 0; v < sampleB; v++) {
      insertVote.run(crypto.randomUUID(), battleId, `seed-b-${i}-${v}.mock.ip`, 'B');
    }
    console.log(`  Inserted ${sampleA + sampleB} sample vote records`);
  }
});

seedAll();

// ── Verification ───────────────────────────────────────────────────────────
console.log('\n── Verification ──');

const battleCount = db.prepare('SELECT COUNT(*) as count FROM battles').get().count;
const subCount = db.prepare('SELECT COUNT(*) as count FROM submissions').get().count;
const voteCount = db.prepare('SELECT COUNT(*) as count FROM votes').get().count;
console.log(`Database now has: ${subCount} submissions, ${battleCount} battles, ${voteCount} votes`);

// Check that we can read a file from storage
if (firstSubmissionId) {
  const testFile = path.join(STORAGE_DIR, firstSubmissionId, 'index.html');
  if (fs.existsSync(testFile)) {
    const content = fs.readFileSync(testFile, 'utf-8');
    console.log(`\nFile check: ${testFile}`);
    console.log(`  Readable: YES (${content.length} bytes)`);
    console.log(`  First 100 chars: ${content.slice(0, 100).replace(/\n/g, ' ')}`);
  } else {
    console.error(`\nWARNING: Could not find index.html at ${testFile}`);
  }
}

db.close();
console.log('\nDone! Seed battles have been ingested.');
