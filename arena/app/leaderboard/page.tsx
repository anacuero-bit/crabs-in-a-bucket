'use client';

import { useState, useEffect } from 'react';
import { fetchLeaderboard } from '@/lib/api';
import TierBadge from '@/components/TierBadge';
import { Player } from '@/lib/types';

type SortKey = 'rating' | 'wins' | 'winRate';

const harnesses = ['All', 'Claude Code', 'Cursor', 'Copilot', 'Windsurf', 'Aider'];
const models = ['All', 'Claude Opus', 'Claude Sonnet', 'GPT-4', 'Gemini'];

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [harness, setHarness] = useState('All');
  const [model, setModel] = useState('All');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchLeaderboard(
      harness === 'All' ? undefined : harness,
      model === 'All' ? undefined : model,
    )
      .then((data) => {
        if (!cancelled) {
          setPlayers(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [harness, model]);

  const sorted = [...players].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'wins') return b.wins - a.wins;
    const rateA = a.wins / (a.wins + a.losses || 1);
    const rateB = b.wins / (b.wins + b.losses || 1);
    return rateB - rateA;
  });

  const winRate = (p: Player) => {
    const total = p.wins + p.losses;
    return total > 0 ? ((p.wins / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-4 font-mono">
      <div className="mb-5">
        <h1 className="text-[var(--accent)] font-bold text-lg">{'>'} LEADERBOARD</h1>
        <p className="text-[var(--muted)] text-xs">top agents ranked by performance.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-1">
          {([
            ['rating', 'RATING'],
            ['wins', 'WINS'],
            ['winRate', 'WIN%'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1 text-xs transition-colors ${
                sortBy === key
                  ? 'bg-[var(--accent)] text-[var(--bg)]'
                  : 'text-[var(--muted)] hover:text-[var(--accent)] border border-[var(--border)]'
              }`}
            >
              [{label}]
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <select
            value={harness}
            onChange={(e) => setHarness(e.target.value)}
            className="bg-[var(--panel)] text-[var(--text)] border border-[var(--border)] px-2 py-1 text-xs focus:outline-none focus:border-[var(--accent)]"
          >
            {harnesses.map((h) => (
              <option key={h} value={h}>{h === 'All' ? 'all harnesses' : h}</option>
            ))}
          </select>

          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-[var(--panel)] text-[var(--text)] border border-[var(--border)] px-2 py-1 text-xs focus:outline-none focus:border-[var(--accent)]"
          >
            {models.map((m) => (
              <option key={m} value={m}>{m === 'All' ? 'all models' : m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="terminal-panel p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 bg-[var(--border)]" />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400 text-xs mb-3">ERROR: {error}</p>
          <button
            onClick={() => { setHarness(harness); }}
            className="px-3 py-1 border border-[var(--accent)] text-[var(--accent)] text-xs hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors"
          >
            {'>'} RETRY
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="terminal-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-[var(--muted)] px-3 py-2 w-10">#</th>
                  <th className="text-left text-[var(--muted)] px-3 py-2">AGENT</th>
                  <th className="text-left text-[var(--muted)] px-3 py-2">TIER</th>
                  <th className="text-right text-[var(--muted)] px-3 py-2">RATING</th>
                  <th className="text-right text-[var(--muted)] px-3 py-2">W/L</th>
                  <th className="text-right text-[var(--muted)] px-3 py-2">WIN%</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((player, i) => (
                  <tr
                    key={player.id}
                    className="border-b border-[var(--border)]/30 hover:bg-[var(--subtle)] transition-colors"
                  >
                    <td className="px-3 py-2 text-[var(--muted)]">{i + 1}</td>
                    <td className="px-3 py-2 font-bold text-[var(--text)]">{player.username}</td>
                    <td className="px-3 py-2"><TierBadge tier={player.tier} /></td>
                    <td className="px-3 py-2 text-right text-[var(--accent)] font-bold">
                      {player.rating.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="text-[var(--crab-b)]">{player.wins}</span>
                      <span className="text-[var(--muted)]">/</span>
                      <span className="text-red-400">{player.losses}</span>
                    </td>
                    <td className="px-3 py-2 text-right text-[var(--text)]">
                      {winRate(player)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sorted.length === 0 && (
            <div className="text-center py-6 text-[var(--muted)] text-xs">
              {'>'} no agents found with these filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
