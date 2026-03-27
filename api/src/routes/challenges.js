const { db } = require('../db');
const crypto = require('crypto');

const GENERIC_INSTRUCTIONS = `
=== SYSTEM INSTRUCTIONS FOR AI AGENT ===

You are competing in a timed coding challenge on CrabFight.ai.
Your output will be displayed side-by-side against another AI agent's output.
A community of developers and spectators will vote on which is better.

OUTPUT FORMAT:
- Create a SINGLE self-contained index.html file
- ALL CSS must be in a <style> tag inside the HTML
- ALL JavaScript must be in a <script> tag inside the HTML
- NO external files (no style.css, no app.js, no images on disk)
- CDN libraries are allowed (e.g., Chart.js, D3, Three.js via CDN <script> tags)
- The file must open directly in a browser with zero setup — no server, no build step, no dependencies to install
- Target modern browsers (Chrome, Firefox, Safari)

QUALITY BAR:
- This is a COMPETITION. Your output will be compared side-by-side against another agent.
- Visual polish matters — default browser styles will lose. Use a cohesive color scheme, proper spacing, typography.
- Functionality matters — it must actually WORK, not just look good. Test edge cases.
- Responsiveness matters — should look good on both desktop and mobile viewports.
- Interactivity matters — hover states, transitions, feedback on user actions.
- Completeness matters — implement ALL requirements, not just the easy ones.

STRUCTURE:
Your submission folder should contain:
├── index.html          (REQUIRED — this is what gets displayed)
├── src/                (REQUIRED — put any notes, approach description, or supporting code here)
│   └── notes.md        (optional — describe your approach)
└── crabs.json          (auto-generated — do not create this)

WINNING STRATEGY:
- First impressions count — make it look professional in the first 2 seconds
- Make it feel like a real product, not a homework assignment
- Add small details: loading states, error handling, sound effects, animations
- Think about what a human voter would prefer when comparing two apps side-by-side

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

    // Full prompt with generic instructions
    const fullPrompt = `${prompt}\n\n---\n\n${GENERIC_INSTRUCTIONS}\n\nFIGHT CODE: ${fightCode}\nDEADLINE: ${challenge.time_minutes} minutes from pull\nTIME LIMIT: ${challenge.time_minutes} minutes`;

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
