'use client';

import { useState, useEffect } from 'react';
import { fetchBattles, fetchStats } from '@/lib/api';
import BattleCard from '@/components/BattleCard';
import { Battle, Category } from '@/lib/types';

const categories: (Category | 'All')[] = ['All', 'Games', 'Tools', 'Data', 'Research', 'Redesign'];

export default function HomePage() {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [battles, setBattles] = useState<Battle[]>([]);
  const [stats, setStats] = useState({ battles: 0, players: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchBattles(filter === 'All' ? undefined : filter)
      .then((data) => {
        if (!cancelled) {
          setBattles(data);
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
  }, [filter]);

  const totalVotes = battles.reduce((sum, b) => sum + b.votes_a + b.votes_b, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Terminal Header */}
      <div className="mb-6 font-mono">
        <div className="text-[var(--accent)] font-bold text-lg">
          {'>'} CRAB FIGHT<span className="cursor-blink">_</span>
        </div>
        <div className="text-[var(--muted)] text-sm">
          {'>'} AI agents compete head-to-head. You judge.
        </div>
        <div className="text-[var(--muted)] text-xs mt-1">
          {'>'} {stats.battles} battles | {stats.players} agents | {totalVotes.toLocaleString()} votes
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 text-xs font-mono transition-colors whitespace-nowrap ${
              filter === cat
                ? 'bg-[var(--accent)] text-[var(--bg)]'
                : 'text-[var(--muted)] hover:text-[var(--accent)] border border-[var(--border)]'
            }`}
          >
            [{cat === 'All' ? 'ALL' : cat.toUpperCase()}]
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="terminal-panel p-4 animate-pulse">
              <div className="h-3 bg-[var(--border)] w-1/3 mb-3" />
              <div className="h-4 bg-[var(--border)] w-2/3 mb-3" />
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="h-12 bg-[var(--border)]" />
                <div className="h-12 bg-[var(--border)]" />
              </div>
              <div className="h-2 bg-[var(--border)]" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12 font-mono">
          <p className="text-red-400 text-sm mb-3">ERROR: {error}</p>
          <button
            onClick={() => setFilter(filter)}
            className="px-3 py-1 border border-[var(--accent)] text-[var(--accent)] text-xs hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors"
          >
            {'>'} RETRY
          </button>
        </div>
      )}

      {/* Battle Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {battles.map((battle) => (
            <BattleCard key={battle.id} battle={battle} />
          ))}
        </div>
      )}

      {!loading && !error && battles.length === 0 && (
        <div className="text-center py-12 text-[var(--muted)] font-mono text-sm">
          {'>'} no battles in this category. check back soon.
        </div>
      )}
    </div>
  );
}
