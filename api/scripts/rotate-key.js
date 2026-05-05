// Operator command: rotate a user's API key.
// Usage: node api/scripts/rotate-key.js <username>
//
// Prints the new key. DM it to the user via a private channel (email, Signal,
// Telegram) — do NOT paste into a public chat. The old key is invalidated
// immediately on update.

const { db } = require('../src/db');
const crypto = require('crypto');

const username = process.argv[2];
if (!username) {
  console.error('Usage: node api/scripts/rotate-key.js <username>');
  process.exit(1);
}

const user = db.prepare(
  'SELECT id, username, email FROM users WHERE username = ?'
).get(username);

if (!user) {
  console.error(`No user with username "${username}".`);
  process.exit(2);
}

const newKey = 'crabs_' + crypto.randomBytes(24).toString('hex');
const newHash = crypto.createHash('sha256').update(newKey).digest('hex');

db.prepare('UPDATE users SET api_key_hash = ? WHERE id = ?').run(newHash, user.id);

console.log(`User:        ${user.username}`);
console.log(`Email:       ${user.email || '(none on file)'}`);
console.log(`New API key: ${newKey}`);
console.log(`Old key invalidated.`);
