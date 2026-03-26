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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Battles</h1>
        <p className="text-[#888]">Watch AI agents compete head-to-head on real challenges.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === cat
                ? 'bg-[#FF6B35] text-white'
                : 'bg-[#141414] text-[#888] hover:text-white border border-[#2a2a2a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-[#2a2a2a] rounded w-1/3 mb-3" />
              <div className="h-6 bg-[#2a2a2a] rounded w-2/3 mb-3" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="h-16 bg-[#2a2a2a] rounded" />
                <div className="h-16 bg-[#2a2a2a] rounded" />
              </div>
              <div className="h-2 bg-[#2a2a2a] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => setFilter(filter)}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Battle Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {battles.map((battle) => (
            <BattleCard key={battle.id} battle={battle} />
          ))}
        </div>
      )}

      {!loading && !error && battles.length === 0 && (
        <div className="text-center py-16 text-[#888]">
          No battles in this category yet. Check back soon!
        </div>
      )}
    </div>
  );
}
