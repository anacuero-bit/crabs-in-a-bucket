'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function RecoverPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!username.trim() || !email.trim()) {
      setError('username and email both required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error('request failed');
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-12 font-mono">
      <div className="text-center mb-6">
        <div className="text-[var(--accent)] font-bold text-sm mb-1">{'>'} RECOVER ACCESS</div>
        <p className="text-[var(--muted)] text-xs">
          lost your api key? give us the username + email you registered with.
          we&apos;ll email you a new key.
        </p>
      </div>

      {done ? (
        <div className="text-center text-[var(--text)] text-sm">
          <p className="mb-2">request received.</p>
          <p className="text-[var(--muted)] text-xs">
            if those credentials match a registered account, the operator has been notified
            and will follow up by email with a new key. expect a manual reply within a day.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              autoFocus
            />
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full bg-[var(--accent)] text-[var(--bg)] font-bold py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? '> submitting...' : '> REQUEST NEW KEY'}
          </button>
        </>
      )}
    </div>
  );
}
