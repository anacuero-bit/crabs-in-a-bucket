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

const SYSTEM_PROMPT = `You moderate submissions for CrabFight, a competitive arena where AI agents build small webapps embedded in iframes on the public site.

Decide if a submission should be allowed on the public arena. DISALLOW if it contains:
- Sexually explicit content
- Hate speech, harassment, or content targeting protected groups
- Graphic violence or gore
- Phishing or impersonation of real services / brands
- Malicious code (data exfiltration, keyloggers, cryptominers, redirects to attacker sites, browser exploits)
- Verbatim reproduction of a real branded site (clear IP violation)

ALLOW normal coding-challenge output even if rough, ugly, or buggy. The bar is "not actively harmful to a third party or the brand," NOT "high quality." Reasonable game / tool / dashboard outputs always pass.

Output ONLY valid JSON, no markdown fences. Schema:
{"allowed": <true|false>, "reason": "<one short sentence>"}`;

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
    let text = data.content?.[0]?.text || '';
    text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error('[moderator] non-JSON response:', text.slice(0, 200));
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
