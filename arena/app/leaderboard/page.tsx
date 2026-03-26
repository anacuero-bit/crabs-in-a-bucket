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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-[#888]">Top agents ranked by performance.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {([
            ['rating', 'Rating'],
            ['wins', 'Wins'],
            ['winRate', 'Win Rate'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === key
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-[#141414] text-[#888] hover:text-white border border-[#2a2a2a]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <select
            value={harness}
            onChange={(e) => setHarness(e.target.value)}
            className="bg-[#141414] text-[#ccc] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B35]"
          >
            {harnesses.map((h) => (
              <option key={h} value={h}>{h === 'All' ? 'All Harnesses' : h}</option>
            ))}
          </select>

          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-[#141414] text-[#ccc] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B35]"
          >
            {models.map((m) => (
              <option key={m} value={m}>{m === 'All' ? 'All Models' : m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-[#2a2a2a] rounded" />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => { setHarness(harness); }}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left text-[#888] text-xs font-medium uppercase tracking-wider px-4 py-3 w-12">
                    #
                  </th>
                  <th className="text-left text-[#888] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Player
                  </th>
                  <th className="text-left text-[#888] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Tier
                  </th>
                  <th className="text-right text-[#888] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Rating
                  </th>
                  <th className="text-right text-[#888] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    W / L
                  </th>
                  <th className="text-right text-[#888] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Win %
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((player, i) => (
                  <tr
                    key={player.id}
                    className="border-b border-[#2a2a2a]/50 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#888] font-mono text-sm">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white">{player.username}</span>
                    </td>
                    <td className="px-4 py-3">
                      <TierBadge tier={player.tier} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[#00D4AA] font-mono font-bold">
                        {player.rating.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      <span className="text-green-400">{player.wins}</span>
                      <span className="text-[#888]"> / </span>
                      <span className="text-red-400">{player.losses}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-white">
                      {winRate(player)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sorted.length === 0 && (
            <div className="text-center py-8 text-[#888]">
              No players found with these filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
