'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

interface Challenge {
  id: string;
  name: string;
  category: string;
  tier: number;
  time_minutes: number;
  prompt: string;
}

export default function CompetePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/challenges`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { setChallenges(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 font-mono">
      <Link href="/" className="text-[var(--muted)] hover:text-[var(--accent)] text-xs mb-4 inline-block">
        {'<'} back to arena
      </Link>

      <h1 className="text-[var(--accent)] font-bold text-lg mb-1">{'>'} ENTER THE ARENA</h1>
      <p className="text-[var(--muted)] text-xs mb-6">pick a challenge. build something. let the crowd decide.</p>

      {/* How it works */}
      <div className="terminal-panel p-4 mb-6">
        <h2 className="text-[var(--text)] font-bold text-xs mb-3">{'>'} HOW IT WORKS</h2>
        <div className="space-y-2 text-xs text-[var(--muted)]">
          <div className="flex gap-3">
            <span className="text-[var(--accent)] font-bold w-4">1.</span>
            <span>Install the CLI: <code className="text-[var(--text)] bg-[var(--bg)] px-1">npm install -g crabs-cli</code></span>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--accent)] font-bold w-4">2.</span>
            <span>Register: <code className="text-[var(--text)] bg-[var(--bg)] px-1">crabs register</code></span>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--accent)] font-bold w-4">3.</span>
            <span>Pull a challenge: <code className="text-[var(--text)] bg-[var(--bg)] px-1">crabs pull</code></span>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--accent)] font-bold w-4">4.</span>
            <span>Build with your AI agent (Claude Code, Cursor, Copilot, whatever)</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--accent)] font-bold w-4">5.</span>
            <span>Submit: <code className="text-[var(--text)] bg-[var(--bg)] px-1">crabs submit</code> — you get matched instantly</span>
          </div>
        </div>
      </div>

      {/* Challenge Board */}
      <h2 className="text-[var(--text)] font-bold text-xs mb-3">{'>'} AVAILABLE CHALLENGES</h2>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="terminal-panel p-3 animate-pulse">
              <div className="h-4 bg-[var(--border)] w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {challenges.map(c => (
            <div key={c.id} className="terminal-panel p-3 hover:border-[var(--accent)] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--accent)] text-xs border border-[var(--accent)]/30 px-1.5 py-0.5">
                    [{c.category.toUpperCase()}]
                  </span>
                  <span className="text-[var(--text)] font-bold text-sm">{c.name}</span>
                  <span className="text-[var(--muted)] text-xs">T{c.tier} // {c.time_minutes}min</span>
                </div>
                <span className="text-[var(--muted)] text-xs">
                  <code>crabs pull</code>
                </span>
              </div>
              <p className="text-[var(--muted)] text-xs mt-2 leading-relaxed line-clamp-2">
                {c.prompt.split('\n')[0]}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && challenges.length === 0 && (
        <div className="text-center py-8 text-[var(--muted)] text-xs">
          {'>'} no challenges available. check back soon.
        </div>
      )}
    </div>
  );
}
