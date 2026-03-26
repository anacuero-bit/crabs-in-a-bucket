const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'arena.db');

// Ensure data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      api_key_hash TEXT,
      agent_name TEXT,
      rating REAL DEFAULT 1500,
      rating_deviation REAL DEFAULT 350,
      tier TEXT DEFAULT 'Bronze',
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      tier INTEGER NOT NULL,
      time_minutes INTEGER NOT NULL,
      prompt TEXT NOT NULL,
      params TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      folder_path TEXT NOT NULL,
      ai_score REAL,
      ai_breakdown TEXT,
      model TEXT,
      harness TEXT,
      time_elapsed TEXT,
      submitted_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (challenge_id) REFERENCES challenges(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS battles (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      submission_a_id TEXT NOT NULL,
      submission_b_id TEXT NOT NULL,
      votes_a INTEGER DEFAULT 0,
      votes_b INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (challenge_id) REFERENCES challenges(id),
      FOREIGN KEY (submission_a_id) REFERENCES submissions(id),
      FOREIGN KEY (submission_b_id) REFERENCES submissions(id)
    );

    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      battle_id TEXT NOT NULL,
      voter_ip TEXT NOT NULL,
      voted_for TEXT NOT NULL CHECK (voted_for IN ('A', 'B')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (battle_id) REFERENCES battles(id),
      UNIQUE(battle_id, voter_ip)
    );
  `);
}

function seed() {
  // Only seed if tables are empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return;

  console.log('Seeding database...');

  // Seed users
  const insertUser = db.prepare(
    'INSERT INTO users (id, username, rating, rating_deviation, tier, wins, losses) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  insertUser.run(crypto.randomUUID(), 'CrabMaster', 1650, 250, 'Gold', 12, 5);
  insertUser.run(crypto.randomUUID(), 'ShellShock', 1520, 300, 'Silver', 8, 7);

  // Seed challenges
  const insertChallenge = db.prepare(
    'INSERT INTO challenges (id, name, category, tier, time_minutes, prompt, params) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  insertChallenge.run(
    crypto.randomUUID(),
    'The Arcade',
    'Games',
    2,
    7,
    `Build a complete, playable [GAME] in a single index.html file.

REQUIREMENTS:
- Fully playable with keyboard (and touch on mobile)
- Score tracking that persists during session
- At least 3 levels of increasing difficulty
- Game over detection + restart without page reload
- Sound effects (Web Audio API)
- Visually polished — not raw HTML

BONUS: Particle effects, screen shake, high score in localStorage, smooth animations.

DELIVER: index.html + src/ with any supporting code or assets.
TIME LIMIT: 7 minutes.`,
    JSON.stringify({ game_options: ['Snake', 'Breakout', 'Space Invaders', 'Asteroids', 'Tetris', 'Whack-a-Mole'] })
  );

  insertChallenge.run(
    crypto.randomUUID(),
    'The Quick Draw',
    'Tools',
    1,
    5,
    `Build a self-contained interactive [TOOL] in a single index.html file.

REQUIREMENTS:
- Core function works completely (input → process → output)
- At least 3 configurable options/settings
- Results are copyable or downloadable
- Includes a brief 'how to use' section
- Visually polished, mobile-friendly
- Looks like a real product, not a homework assignment

DELIVER: index.html + src/ with any supporting code.
TIME LIMIT: 5 minutes.`,
    JSON.stringify({
      tool_options: [
        'Regex Tester with visual match highlighting',
        'JSON Formatter with tree view and error highlighting',
        'Color Palette Generator from a keyword',
        'Password Generator with strength meter',
        'Markdown Editor with live preview',
        'Meeting Cost Calculator'
      ]
    })
  );

  insertChallenge.run(
    crypto.randomUUID(),
    'The Snapshot',
    'Data',
    2,
    7,
    `Fetch real, current data about [TOPIC] and build an interactive dashboard in a single index.html file.

REQUIREMENTS:
- Data must be real and current (fetched during the challenge, not hardcoded)
- At least 2 different chart types (bar, line, pie, etc.)
- At least 1 interactive element (filter, sort, hover details, toggle)
- Data source credited with link
- 'Last updated' timestamp showing when data was fetched
- May use Chart.js, D3, or similar via CDN

DELIVER: index.html + src/ with data processing code.
TIME LIMIT: 7 minutes.`,
    JSON.stringify({
      topic_options: [
        'Top 10 cryptocurrencies by market cap',
        'Current weather across 8 world capitals',
        'Top trending GitHub repos right now',
        'Live currency exchange rates for 10 currencies vs USD'
      ]
    })
  );

  console.log('Seeded 2 users and 3 challenges.');
}

function migrate() {
  // Add columns if they don't exist (safe for existing DBs)
  try { db.exec('ALTER TABLE users ADD COLUMN api_key_hash TEXT'); } catch {}
  try { db.exec('ALTER TABLE users ADD COLUMN agent_name TEXT'); } catch {}
}

function init() {
  createTables();
  migrate();
  seed();
}

module.exports = { db, init };
