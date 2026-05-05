// Pre-publish content moderator. Uses Claude Haiku to scan the submission's
// index.html and decide if it's safe to render on the public arena.
//
// Fail-closed: if the API is unreachable or the response is malformed, we
// REJECT the submission. The user-facing flow surfaces this as a retry/contact
// path, same shape as a house-crab failure.

const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_HTML_BYTES = 100 * 1024; // 100KB cap to bound cost/latency

const SYSTEM_PROMPT = `You are CrabFight's content-safety moderator. You decide whether a submission is safe to render on the public site. You do NOT decide whether it satisfies the challenge brief — a separate AI Referee handles quality scoring. Quality, completeness, beauty, and "does this match what the prompt asked for" are NOT your concern.

ONLY disallow if the submission contains one of these:
- Sexually explicit content
- Hate speech, harassment, or content targeting protected groups
- Graphic violence or gore
- Phishing or impersonation of a real service / brand
- Malicious code (data exfiltration to attacker servers, keyloggers, cryptominers, redirects to malicious sites, browser exploits)
- Verbatim reproduction of a real branded site (clear IP violation)

ALLOW everything else. Allow tiny submissions ("hello world", "smoke test", a single h1, an empty page). Allow off-topic submissions that don't match the challenge. Allow ugly, broken, or buggy code. Allow lorem ipsum. Allow placeholder text. Allow JOKE submissions, pranks, or self-aware bad-faith effort. None of those harm anyone.

If you are unsure whether something is harmful, ALLOW it.

Output ONLY valid JSON, no markdown fences. Schema:
{"allowed": <true|false>, "reason": "<one short sentence; for allows, just say 'safe'>"}`;

async function moderateSubmission({ folderPath, challengePrompt }) {
  const indexPath = findIndexHtml(folderPath);
  if (!indexPath) {
    return { allowed: false, reason: 'No index.html found to moderate.' };
  }

  if (!ANTHROPIC_API_KEY) {
    return { allowed: false, reason: 'Moderator unavailable (missing API key); fail-closed.' };
  }

  let html;
  try {
    html = fs.readFileSync(indexPath, 'utf-8');
  } catch (err) {
    return { allowed: false, reason: 'Could not read index.html: ' + err.message };
  }

  if (html.length > MAX_HTML_BYTES) {
    html = html.slice(0, MAX_HTML_BYTES) + '\n\n[truncated]';
  }

  const userMessage = `Challenge prompt:\n${challengePrompt || '(none)'}\n\nindex.html:\n\`\`\`html\n${html}\n\`\`\``;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[moderator] API error:', res.status, body);
      return { allowed: false, reason: 'Moderator API error; fail-closed.' };
    }
    const data = await res.json();
    const raw = data.content?.[0]?.text || '';
    const parsed = extractJson(raw);
    if (!parsed) {
      console.error('[moderator] could not parse response. raw bytes:', Buffer.from(raw).toString('hex').slice(0, 400));
      console.error('[moderator] raw text:', JSON.stringify(raw).slice(0, 400));
      return { allowed: false, reason: 'Moderator returned malformed response; fail-closed.' };
    }
    if (typeof parsed.allowed !== 'boolean') {
      return { allowed: false, reason: 'Moderator response missing allowed field; fail-closed.' };
    }
    return {
      allowed: parsed.allowed,
      reason: parsed.reason || (parsed.allowed ? 'allowed' : 'flagged'),
    };
  } catch (err) {
    console.error('[moderator] fetch error:', err.message);
    return { allowed: false, reason: 'Moderator fetch failed; fail-closed.' };
  }
}

// Pull a JSON object out of model output. Tries: raw, fenced markdown,
// and a fall-through regex that grabs the first {...} block. Returns the
// parsed object or null.
function extractJson(text) {
  if (!text) return null;
  const candidates = [
    text,
    text.replace(/^[\s\S]*?```(?:json)?\s*/i, '').replace(/```[\s\S]*$/, ''),
    (text.match(/\{[\s\S]*\}/) || [])[0],
  ];
  for (const c of candidates) {
    if (!c) continue;
    try { return JSON.parse(c.trim()); } catch {}
  }
  return null;
}

function findIndexHtml(folderPath) {
  const direct = path.join(folderPath, 'index.html');
  if (fs.existsSync(direct)) return direct;
  for (const entry of fs.readdirSync(folderPath)) {
    const nested = path.join(folderPath, entry);
    if (fs.statSync(nested).isDirectory()) {
      const candidate = path.join(nested, 'index.html');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

module.exports = { moderateSubmission };
