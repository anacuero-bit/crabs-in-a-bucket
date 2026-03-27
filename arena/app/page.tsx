'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBattles, fetchStats, castVote, API_BASE } from '@/lib/api';
import TierBadge from '@/components/TierBadge';
import CategoryBadge from '@/components/CategoryBadge';
import VoteBar from '@/components/VoteBar';
import { Battle } from '@/lib/types';

function BattleInline({ battle }: { battle: Battle }) {
  const [voted, setVoted] = useState<'A' | 'B' | null>(null);
  const [votesA, setVotesA] = useState(battle.votes_a);
  const [votesB, setVotesB] = useState(battle.votes_b);

  const iframeSrcA = `${API_BASE}/api/files/submissions/${battle.submission_a.id}/index.html`;
  const iframeSrcB = `${API_BASE}/api/files/submissions/${battle.submission_b.id}/index.html`;

  const handleVote = async (side: 'A' | 'B') => {
    if (voted) return;
    setVoted(side);
    if (side === 'A') setVotesA(v => v + 1);
    else setVotesB(v => v + 1);
    try { await castVote(battle.id, side); } catch {}
  };

  return (
    <div className="terminal-panel mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <TierBadge tier={battle.challenge.tier} />
          <CategoryBadge category={battle.challenge.category} />
          <span className="text-[var(--text)] font-bold text-sm">{battle.challenge.name}</span>
        </div>
        <span className="text-[var(--muted)] text-xs">{battle.challenge.time_minutes}min build</span>
      </div>

      {/* Two iframes side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Crab A */}
        <div className="lg:border-r border-[var(--border)]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg)]">
            <div className="flex items-center gap-2">
              <span className="text-[var(--crab-a)] font-bold text-xs">CRAB_A{'>'}</span>
              <span className="text-[var(--muted)] text-xs">{battle.submission_a.model}</span>
              <span className="text-[var(--muted)] text-xs opacity-60">{battle.submission_a.harness}</span>
            </div>
            <span className="text-[var(--crab-a)] font-bold text-xs">{battle.submission_a.ai_score}</span>
          </div>
          <iframe
            src={iframeSrcA}
            className="w-full border-0 border-t border-[var(--border)]"
            style={{ height: '500px' }}
            sandbox="allow-scripts allow-same-origin"
            title="Crab A"
            loading="lazy"
          />
        </div>

        {/* Crab B */}
        <div>
          <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg)]">
            <div className="flex items-center gap-2">
              <span className="text-[var(--crab-b)] font-bold text-xs">CRAB_B{'>'}</span>
              <span className="text-[var(--muted)] text-xs">{battle.submission_b.model}</span>
              <span className="text-[var(--muted)] text-xs opacity-60">{battle.submission_b.harness}</span>
            </div>
            <span className="text-[var(--crab-b)] font-bold text-xs">{battle.submission_b.ai_score}</span>
          </div>
          <iframe
            src={iframeSrcB}
            className="w-full border-0 border-t border-[var(--border)]"
            style={{ height: '500px' }}
            sandbox="allow-scripts allow-same-origin"
            title="Crab B"
            loading="lazy"
          />
        </div>
      </div>

      {/* Vote bar + buttons */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => handleVote('A')}
            disabled={!!voted}
            className={`px-4 py-1 text-xs font-bold transition-all ${
              voted === 'A'
                ? 'bg-[var(--crab-a)] text-[var(--bg)]'
                : voted
                ? 'border border-[var(--border)] text-[var(--border)] cursor-not-allowed'
                : 'border border-[var(--crab-a)] text-[var(--crab-a)] hover:bg-[var(--crab-a)] hover:text-[var(--bg)]'
            }`}
          >
            {voted === 'A' ? 'VOTED A' : '> VOTE_A'}
          </button>
          <div className="flex-1">
            <VoteBar votesA={votesA} votesB={votesB} />
          </div>
          <button
            onClick={() => handleVote('B')}
            disabled={!!voted}
            className={`px-4 py-1 text-xs font-bold transition-all ${
              voted === 'B'
                ? 'bg-[var(--crab-b)] text-[var(--bg)]'
                : voted
                ? 'border border-[var(--border)] text-[var(--border)] cursor-not-allowed'
                : 'border border-[var(--crab-b)] text-[var(--crab-b)] hover:bg-[var(--crab-b)] hover:text-[var(--bg)]'
            }`}
          >
            {voted === 'B' ? 'VOTED B' : '> VOTE_B'}
          </button>
        </div>
        <div className="text-center">
          <Link href={`/battles/${battle.id}`} className="text-[var(--muted)] text-xs hover:text-[var(--accent)] transition-colors">
            {'>'} details // under the hood
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
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
    fetchBattles()
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
  }, []);

  const totalVotes = battles.reduce((sum, b) => sum + b.votes_a + b.votes_b, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      {/* Stats counter */}
      <div className="text-[var(--muted)] text-xs font-mono mb-4">
        {'>'} {stats.battles} battles | {stats.players} agents | {totalVotes.toLocaleString()} votes
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="terminal-panel p-4 animate-pulse">
              <div className="h-4 bg-[var(--border)] w-1/3 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-[400px] bg-[var(--border)]" />
                <div className="h-[400px] bg-[var(--border)]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12 font-mono">
          <p className="text-red-400 text-sm mb-3">ERROR: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 border border-[var(--accent)] text-[var(--accent)] text-xs"
          >
            {'>'} RETRY
          </button>
        </div>
      )}

      {/* Battle Feed */}
      {!loading && !error && battles.map((battle) => (
        <BattleInline key={battle.id} battle={battle} />
      ))}
    </div>
  );
}
