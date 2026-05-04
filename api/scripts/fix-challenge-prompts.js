// One-time migration: rewrite seed challenge prompts to remove contradictions
// flagged by the Codex prod-readiness audit (2026-05-03):
//   - "no external files" + "DELIVER: index.html + src/ with supporting code" was contradictory
//   - "Visually polished, mobile-friendly" contradicted GENERIC_INSTRUCTIONS "Desktop only"
//   - "Fully playable with keyboard (and touch on mobile)" contradicted desktop-only
//
// New prompts match the updated GENERIC_INSTRUCTIONS in routes/challenges.js.
// Re-running is idempotent (same UPDATE).

const { db } = require('../src/db');

const updates = [
  {
    name: 'The Arcade',
    prompt: `Build a complete, playable [GAME] in a single index.html file.

REQUIREMENTS:
- Fully playable with keyboard
- Score tracking that persists during session
- At least 3 levels of increasing difficulty
- Game over detection + restart without page reload
- Sound effects (Web Audio API)
- Visually polished — not raw HTML

BONUS: Particle effects, screen shake, high score in localStorage, smooth animations.

DELIVER: a single self-contained index.html. Optional src/notes.md for your approach.
TIME LIMIT: 7 minutes.`,
  },
  {
    name: 'The Quick Draw',
    prompt: `Build a self-contained interactive [TOOL] in a single index.html file.

REQUIREMENTS:
- Core function works completely (input → process → output)
- At least 3 configurable options/settings
- Results are copyable or downloadable
- Includes a brief 'how to use' section
- Visually polished — desktop layout, fits 1280x720 without scrolling
- Looks like a real product, not a homework assignment

DELIVER: a single self-contained index.html. Optional src/notes.md for your approach.
TIME LIMIT: 5 minutes.`,
  },
  {
    name: 'The Snapshot',
    prompt: `Fetch real, current data about [TOPIC] and build an interactive dashboard in a single index.html file.

REQUIREMENTS:
- Data must be real and current (fetched during the challenge, not hardcoded)
- At least 2 different chart types (bar, line, pie, etc.)
- At least 1 interactive element (filter, sort, hover details, toggle)
- Data source credited with link
- 'Last updated' timestamp showing when data was fetched
- May use Chart.js, D3, or similar via CDN

DELIVER: a single self-contained index.html. Optional src/notes.md for your approach.
TIME LIMIT: 7 minutes.`,
  },
];

let touched = 0;
const stmt = db.prepare('UPDATE challenges SET prompt = ? WHERE name = ?');
for (const u of updates) {
  const result = stmt.run(u.prompt, u.name);
  if (result.changes > 0) {
    console.log(`Updated: ${u.name}`);
    touched += result.changes;
  } else {
    console.log(`Skipped (not found): ${u.name}`);
  }
}
console.log(`\n${touched} challenge(s) updated.`);
