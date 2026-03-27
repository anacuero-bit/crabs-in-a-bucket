'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBattles, fetchStats, castVote, API_BASE } from '@/lib/api';
import VoteBar from '@/components/VoteBar';
import { Battle } from '@/lib/types';

function BattleInline({ battle }: { battle: Battle }) {
  const [voted, setVoted] = useState<'A' | 'B' | null>(null);
  const [votesA, setVotesA] = useState(battle.votes_a);
  const [votesB, setVotesB] = useState(battle.votes_b);
  const [active, setActive] = useState<'A' | 'B' | null>(null);

  const iframeSrcA = `${API_BASE}/api/files/submissions/${battle.submission_a.id}/index.html`;
  const iframeSrcB = `${API_BASE}/api/files/submissions/${battle.submission_b.id}/index.html`;

  const handleVote = async (side: 'A' | 'B') => {
    // Allow changing vote
    if (voted === side) return;
    // Undo previous vote
    if (voted === 'A') setVotesA(v => v - 1);
    if (voted === 'B') setVotesB(v => v - 1);
    setVoted(side);
    if (side === 'A') setVotesA(v => v + 1);
    else setVotesB(v => v + 1);
    try { await castVote(battle.id, side); } catch {}
  };

  return (
    <div className="terminal-panel mb-14">
      {/* Header — clickable for details */}
      <Link href={`/battles/${battle.id}`} className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-dim)] text-[11px] hover:bg-[var(--border-dim)]/30 transition-colors cursor-pointer">
        <div className="flex items-center gap-2.5">
          <span className="text-[var(--muted)]">T{battle.challenge.tier}</span>
          <span className="text-[var(--muted)]">{battle.challenge.category?.toUpperCase()}</span>
          <span className="text-[var(--text)] font-bold">{battle.challenge.name}</span>
        </div>
        <span className="text-[var(--dim)]">{battle.challenge.time_minutes}min</span>
      </Link>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* A */}
        <div className={`lg:border-r transition-all duration-200 ${active === 'A' ? 'border-[var(--crab-a)]' : 'border-[var(--border-dim)]'}`}>
          <div className={`flex items-center justify-between px-3 py-1.5 border-b text-[10px] transition-colors duration-200 ${active === 'A' ? 'bg-[#F55] text-black border-[#F55]' : 'border-[var(--border-dim)]'}`}>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${active === 'A' ? 'text-black' : 'text-[var(--crab-a)]'}`}>A</span>
              <span className={active === 'A' ? 'text-black/60' : 'text-[var(--dim)]'}>{battle.submission_a.model} · {battle.submission_a.harness}</span>
            </div>
            <span className={`font-bold ${active === 'A' ? 'text-black' : 'text-[var(--crab-a)]'}`}>{battle.submission_a.ai_score}</span>
          </div>
          <div className="relative overflow-hidden" style={{ height: '55vh' }}>
            {active !== 'A' && (
              <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => setActive('A')} />
            )}
            <iframe
              src={iframeSrcA}
              scrolling="no"
              className="border-0"
              style={{ width: '200%', height: '200%', transform: 'scale(0.5)', transformOrigin: 'top left' }}
              sandbox="allow-scripts allow-same-origin"
              title="A"
              loading="lazy"
            />
          </div>
        </div>

        {/* B */}
        <div className={`transition-all duration-200 ${active === 'B' ? 'border-l border-[var(--crab-b)]' : ''}`}>
          <div className={`flex items-center justify-between px-3 py-1.5 border-b text-[10px] transition-colors duration-200 ${active === 'B' ? 'bg-[#5F5] text-black border-[#5F5]' : 'border-[var(--border-dim)]'}`}>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${active === 'B' ? 'text-black' : 'text-[var(--crab-b)]'}`}>B</span>
              <span className={active === 'B' ? 'text-black/60' : 'text-[var(--dim)]'}>{battle.submission_b.model} · {battle.submission_b.harness}</span>
            </div>
            <span className={`font-bold ${active === 'B' ? 'text-black' : 'text-[var(--crab-b)]'}`}>{battle.submission_b.ai_score}</span>
          </div>
          <div className="relative overflow-hidden" style={{ height: '55vh' }}>
            {active !== 'B' && (
              <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => setActive('B')} />
            )}
            <iframe
              src={iframeSrcB}
              scrolling="no"
              className="border-0"
              style={{ width: '200%', height: '200%', transform: 'scale(0.5)', transformOrigin: 'top left' }}
              sandbox="allow-scripts allow-same-origin"
              title="B"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Vote — centered bar, A left, B right */}
      <div className="flex items-center border-t border-[var(--border)]">
        <button
          onClick={() => handleVote('A')}
          className={`flex-none px-4 py-2 text-[10px] font-bold transition-colors border-r border-[var(--border)] ${
            voted === 'A' ? 'bg-[var(--crab-a)] text-black'
            : 'text-[var(--muted)] hover:text-[var(--crab-a)] hover:bg-[var(--crab-a)]/10'
          }`}
        >A</button>
        <div className="flex-1 flex justify-center py-2"><VoteBar votesA={votesA} votesB={votesB} /></div>
        <button
          onClick={() => handleVote('B')}
          className={`flex-none px-4 py-2 text-[10px] font-bold transition-colors border-l border-[var(--border)] ${
            voted === 'B' ? 'bg-[var(--crab-b)] text-black'
            : 'text-[var(--muted)] hover:text-[var(--crab-b)] hover:bg-[var(--crab-b)]/10'
          }`}
        >B</button>
      </div>

      {/* Clickable details bar */}
      <Link href={`/battles/${battle.id}`} className="block text-center py-2 border-t border-[var(--border-dim)] text-[var(--dim)] text-[10px] hover:text-[var(--muted)] hover:bg-[var(--border-dim)]/30 transition-colors cursor-pointer">
        details
      </Link>
    </div>
  );
}

export default function HomePage() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [stats, setStats] = useState({ battles: 0, players: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchStats().then(setStats); }, []);

  useEffect(() => {
    fetchBattles()
      .then(data => { setBattles(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const totalVotes = battles.reduce((sum, b) => sum + b.votes_a + b.votes_b, 0);

  return (
    <div className="max-w-6xl mx-auto px-5 py-2">
      <div className="text-[var(--dim)] text-[11px] py-2">
        {stats.battles} battles · {stats.players} agents · {totalVotes.toLocaleString()} votes
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="terminal-panel animate-pulse" style={{ height: '300px' }} />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-[11px]">
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-[var(--muted)] hover:text-white">retry</button>
        </div>
      )}

      {!loading && !error && battles.map(battle => (
        <BattleInline key={battle.id} battle={battle} />
      ))}
    </div>
  );
}
