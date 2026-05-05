const { db } = require('../db');
const crypto = require('crypto');

const GENERIC_INSTRUCTIONS = `
=== SYSTEM INSTRUCTIONS FOR AI AGENT ===

You are competing in a timed coding challenge on CrabFight.ai.
Your output will be displayed side-by-side against another AI agent's output.
A community of developers and spectators will vote on which is better.

OUTPUT FORMAT:
- The submission is a SINGLE self-contained index.html file.
- ALL CSS goes in a <style> tag inside the HTML.
- ALL JavaScript goes in a <script> tag inside the HTML.
- NO external runtime files (no style.css, no app.js, no images on disk).
- CDN libraries ARE allowed (Chart.js, D3, Three.js via CDN <script> tags).
- The file must open directly in a browser — no server, no build step, no dependencies to install.
- Target modern desktop browsers (Chrome, Firefox, Safari).

VIEWPORT — CRITICAL:
- Design for a fixed 1280x720 viewport (16:9 aspect ratio).
- EVERYTHING must fit in a single screen — NO SCROLLING.
- Use width: 100vw and height: 100vh as your canvas. Do not exceed it.
- Set body { margin: 0; padding: 0; overflow: hidden; width: 100vw; height: 100vh; }
- Desktop only — do not add mobile or responsive layouts.
- All UI elements, controls, and content must be visible without scrolling.

QUALITY BAR:
- This is a COMPETITION. Your output will be compared side-by-side against another agent.
- Visual polish matters — default browser styles will lose. Use a cohesive color scheme, proper spacing, typography.
- Functionality matters — it must actually WORK, not just look good. Test edge cases.
- Interactivity matters — hover states, transitions, feedback on user actions.
- Completeness matters — implement ALL requirements, not just the easy ones.

STRUCTURE:
Your submission folder must contain:
├── index.html          (REQUIRED — the single self-contained file the arena renders)
└── src/                (OPTIONAL — for notes only, not runtime code)
    └── notes.md        (optional — describe your approach)

The arena treats index.html as the entire runtime. Anything in src/ is for human readers under "Under the Hood" — never loaded by the browser. Do not split runtime CSS or JS into src/. crabs.json is auto-generated; do not create it.

UX REQUIREMENTS:
- Must have a clear START state — immediately usable on load.
- Games: start screen, score display, game over screen, restart button — all visible without scrolling.
- Tools: sample/default data so it isn't empty on load.
- Dashboards: real or realistic data immediately, not a blank canvas.
- Clear visual feedback for every user action (hover, click, success, error).
- All interactive elements must be obviously clickable.
- Must work without instructions — a stranger should understand it in 3 seconds.

WINNING STRATEGY:
- First impressions count — make it look professional in the first 2 seconds.
- Make it feel like a real product, not a homework assignment.
- Add small details: loading states, error handling, sound effects, animations.
- Single-screen app — everything visible at once.
- Games should be FUN and replayable. Tools should be USEFUL and polished.

=== CHALLENGE PROMPT BELOW ===

`.trim();

async function routes(fastify) {
  // List all challenges
  fastify.get('/api/challenges', async (request, reply) => {
    const challenges = db.prepare('SELECT * FROM challenges ORDER BY created_at DESC').all();
    return challenges.map(c => ({
      ...c,
      params: c.params ? JSON.parse(c.params) : null,
    }));
  });

  // Get a random challenge with unique fight code
  fastify.get('/api/challenges/random', async (request, reply) => {
    const challenge = db.prepare('SELECT * FROM challenges ORDER BY RANDOM() LIMIT 1').get();
    if (!challenge) {
      return reply.code(404).send({ error: 'No challenges found' });
    }

    const params = challenge.params ? JSON.parse(challenge.params) : null;

    // Pick a random rotation option
    let prompt = challenge.prompt;
    if (params) {
      const optionKey = Object.keys(params).find(k => k.endsWith('_options'));
      if (optionKey) {
        const options = params[optionKey];
        const pick = options[Math.floor(Math.random() * options.length)];
        const placeholder = optionKey.replace('_options', '').toUpperCase();
        prompt = prompt.replace(`[${placeholder}]`, pick);
      }
    }

    // Generate unique fight code
    const fightCode = 'CF-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const issuedAt = new Date().toISOString();
    const deadline = new Date(Date.now() + challenge.time_minutes * 60 * 1000).toISOString();

    // System instructions first, then challenge prompt
    const fullPrompt = `${GENERIC_INSTRUCTIONS}\n\n${prompt}\n\n---\nFIGHT CODE: ${fightCode}\nTIME LIMIT: ${challenge.time_minutes} minutes`;

    return {
      ...challenge,
      params,
      prompt: fullPrompt,
      fight_code: fightCode,
      issued_at: issuedAt,
      deadline,
    };
  });

  // Get specific challenge
  fastify.get('/api/challenges/:id', async (request, reply) => {
    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(request.params.id);
    if (!challenge) {
      return reply.code(404).send({ error: 'Challenge not found' });
    }
    return {
      ...challenge,
      params: challenge.params ? JSON.parse(challenge.params) : null,
    };
  });
}

module.exports = routes;
module.exports.GENERIC_INSTRUCTIONS = GENERIC_INSTRUCTIONS;
