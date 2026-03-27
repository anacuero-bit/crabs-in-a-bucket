'use client';

import { useState, useEffect } from 'react';
import { fetchBattles } from '@/lib/api';
import BattleCard from '@/components/BattleCard';
import { Battle, Category } from '@/lib/types';

const categories: (Category | 'All')[] = ['All', 'Games', 'Tools', 'Data', 'Research', 'Redesign'];

export default function BattlesPage() {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 font-mono">
      <h1 className="text-[var(--accent)] font-bold text-lg mb-1">{'>'} BATTLES</h1>
      <p className="text-[var(--muted)] text-xs mb-4">browse all fights by category.</p>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
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

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="terminal-panel p-4 animate-pulse">
              <div className="h-3 bg-[var(--border)] w-1/3 mb-3" />
              <div className="h-4 bg-[var(--border)] w-2/3 mb-3" />
              <div className="h-2 bg-[var(--border)]" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-400 text-xs mb-3">ERROR: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {battles.map((battle) => (
            <BattleCard key={battle.id} battle={battle} />
          ))}
        </div>
      )}

      {!loading && !error && battles.length === 0 && (
        <div className="text-center py-12 text-[var(--muted)] text-xs">
          {'>'} no battles in this category.
        </div>
      )}
    </div>
  );
}
