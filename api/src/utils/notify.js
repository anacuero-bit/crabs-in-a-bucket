// Telegram notifier — pings the operator (Manuel) via @honeypotclawbot.
// Reads TELEGRAM_BOT_TOKEN + MANUEL_TELEGRAM_USER_ID from the brand env.
// Silently degrades if either is missing — no-ops, returns false.

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.MANUEL_TELEGRAM_USER_ID;

async function notifyManuel(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[notify] TELEGRAM_BOT_TOKEN or MANUEL_TELEGRAM_USER_ID missing — skipped');
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[notify] Telegram send failed:', res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[notify] fetch error:', err.message);
    return false;
  }
}

module.exports = { notifyManuel };
