'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchBattles, fetchStats, castVote, API_BASE, isRealBreakdown, hasRealBreakdown } from '@/lib/api';
import VoteBar from '@/components/VoteBar';
import { Battle } from '@/lib/types';

function ExpandedIframe({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <iframe
        src={src}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
      <button
        onClick={onClose}
        className="fixed top-3 right-4 text-white/40 text-[10px] hover:text-white/80 transition-colors z-50"
      >
        esc to close
      </button>
    </div>
  );
}

function BattleInline({ battle }: { battle: Battle }) {
  const [voted, setVoted] = useState<'A' | 'B' | null>(null);
  const [votesA, setVotesA] = useState(battle.votes_a);
  const [votesB, setVotesB] = useState(battle.votes_b);
  const [active, setActive] = useState<'A' | 'B' | null>(null);
  const [expanded, setExpanded] = useState<'A' | 'B' | null>(null);
  const [hood, setHood] = useState(false);
  const [iframeScale, setIframeScale] = useState(0.5);
  const panelRef = useRef<HTMLDivElement>(null);

  // Dynamically scale iframes based on container width
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Each iframe panel is half the grid width (or full on mobile)
        const panelWidth = entry.contentRect.width;
        const cols = window.innerWidth >= 1024 ? 2 : 1; // lg breakpoint
        const iframeContainerWidth = panelWidth / cols;
        setIframeScale(iframeContainerWidth / 1280);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const iframeSrcA = `${API_BASE}/api/files/submissions/${battle.submission_a.id}/index.html`;
  const iframeSrcB = `${API_BASE}/api/files/submissions/${battle.submission_b.id}/index.html`;

  const handleVote = async (side: 'A' | 'B') => {
    if (voted === side) return;
    if (voted === 'A') setVotesA(v => v - 1);
    if (voted === 'B') setVotesB(v => v - 1);
    setVoted(side);
    if (side === 'A') setVotesA(v => v + 1);
    else setVotesB(v => v + 1);
    try { await castVote(battle.id, side); } catch {}
  };

  const formatBreakdown = (bd: string | Record<string, unknown> | null | undefined) => {
    if (!bd) return null;
    if (typeof bd === 'string') return bd;
    return JSON.stringify(bd, null, 2);
  };

  return (
    <>
    {expanded === 'A' && <ExpandedIframe src={iframeSrcA} onClose={() => setExpanded(null)} />}
    {expanded === 'B' && <ExpandedIframe src={iframeSrcB} onClose={() => setExpanded(null)} />}
    <div className="terminal-panel mb-14">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-dim)] text-[11px]">
        <div className="flex items-center gap-2.5">
          <span className="text-[var(--muted)]">T{battle.challenge.tier}</span>
          <span className="text-[var(--muted)]">{battle.challenge.category?.toUpperCase()}</span>
          <span className="text-[var(--text)] font-bold">{battle.challenge.name}</span>
        </div>
        <span className="text-[var(--dim)]">{battle.challenge.time_minutes}min</span>
      </div>

      {/* Panels */}
      <div ref={panelRef} className="grid grid-cols-1 lg:grid-cols-2">
        {/* A */}
        <div className={`lg:border-r transition-all duration-200 ${active === 'A' ? 'border-[var(--crab-a)]' : 'border-[var(--border-dim)]'}`}>
          <div className={`flex items-center justify-between px-3 py-1.5 border-b text-[10px] transition-colors duration-200 ${active === 'A' ? 'bg-[#F55] text-black border-[#F55]' : 'border-[var(--border-dim)]'}`}>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${active === 'A' ? 'text-black' : 'text-[var(--crab-a)]'}`}>A</span>
              <span className={active === 'A' ? 'text-black/60' : 'text-[var(--dim)]'}>{battle.submission_a.model} · {battle.submission_a.harness}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${active === 'A' ? 'text-black' : 'text-[var(--crab-a)]'}`}>{battle.submission_a.ai_score ?? '—'}</span>
              <button onClick={() => setExpanded('A')} className={`${active === 'A' ? 'text-black/60 hover:text-black' : 'text-[var(--dim)] hover:text-[var(--text)]'} transition-colors`}>[ expand ]</button>
            </div>
          </div>
          <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {active !== 'A' && (
              <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => setActive('A')} />
            )}
            <iframe
              src={iframeSrcA}
              scrolling="no"
              className="border-0 absolute top-0 left-0"
              style={{ width: '1280px', height: '720px', transform: `scale(${iframeScale})`, transformOrigin: 'top left' }}
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
            <div className="flex items-center gap-2">
              <span className={`font-bold ${active === 'B' ? 'text-black' : 'text-[var(--crab-b)]'}`}>{battle.submission_b.ai_score ?? '—'}</span>
              <button onClick={() => setExpanded('B')} className={`${active === 'B' ? 'text-black/60 hover:text-black' : 'text-[var(--dim)] hover:text-[var(--text)]'} transition-colors`}>[ expand ]</button>
            </div>
          </div>
          <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {active !== 'B' && (
              <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => setActive('B')} />
            )}
            <iframe
              src={iframeSrcB}
              scrolling="no"
              className="border-0 absolute top-0 left-0"
              style={{ width: '1280px', height: '720px', transform: `scale(${iframeScale})`, transformOrigin: 'top left' }}
              sandbox="allow-scripts allow-same-origin"
              title="B"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Vote — text only, no boxes */}
      <div className="flex items-center border-t border-[var(--border)] py-2 px-3">
        <button
          onClick={() => handleVote('A')}
          className={`text-[10px] font-bold transition-colors ${
            voted === 'A' ? 'text-[var(--crab-a)]' : 'text-[var(--dim)] hover:text-[var(--crab-a)]'
          }`}
        >{voted === 'A' ? 'voted A' : 'vote A'}</button>
        <div className="flex-1 flex justify-center">
          <VoteBar votesA={votesA} votesB={votesB} />
        </div>
        <button
          onClick={() => handleVote('B')}
          className={`text-[10px] font-bold transition-colors ${
            voted === 'B' ? 'text-[var(--crab-b)]' : 'text-[var(--dim)] hover:text-[var(--crab-b)]'
          }`}
        >{voted === 'B' ? 'voted B' : 'vote B'}</button>
      </div>

      {/* Under the Hood — expandable inline */}
      <button
        onClick={() => setHood(!hood)}
        className="w-full text-center py-1.5 border-t border-[var(--border-dim)] text-[var(--dim)] text-[10px] hover:text-[var(--muted)] hover:bg-[var(--border-dim)]/20 transition-colors"
      >
        under the hood {hood ? '[-]' : '[+]'}
      </button>

      {hood && (
        <div className="border-t border-[var(--border-dim)] px-3 py-3 text-[10px] space-y-3">
          {(battle.submission_a.ai_score == null || battle.submission_b.ai_score == null) && (
            <div className="text-[var(--dim)]">{'>'} ai referee in development — community vote is the live signal</div>
          )}
          {/* Stacks */}
          <div>
            <div className="text-[var(--muted)] font-bold mb-1.5">stacks</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-[var(--crab-a)] font-bold">A</div>
                <div className="flex justify-between"><span className="text-[var(--dim)]">model</span><span>{battle.submission_a.model}</span></div>
                <div className="flex justify-between"><span className="text-[var(--dim)]">harness</span><span>{battle.submission_a.harness}</span></div>
                <div className="flex justify-between"><span className="text-[var(--dim)]">score</span><span className="text-[var(--crab-a)]">{battle.submission_a.ai_score ?? 'pending'}</span></div>
                {battle.submission_a.time_elapsed != null && <div className="flex justify-between"><span className="text-[var(--dim)]">time</span><span>{battle.submission_a.time_elapsed}</span></div>}
              </div>
              <div className="space-y-1">
                <div className="text-[var(--crab-b)] font-bold">B</div>
                <div className="flex justify-between"><span className="text-[var(--dim)]">model</span><span>{battle.submission_b.model}</span></div>
                <div className="flex justify-between"><span className="text-[var(--dim)]">harness</span><span>{battle.submission_b.harness}</span></div>
                <div className="flex justify-between"><span className="text-[var(--dim)]">score</span><span className="text-[var(--crab-b)]">{battle.submission_b.ai_score ?? 'pending'}</span></div>
                {battle.submission_b.time_elapsed != null && <div className="flex justify-between"><span className="text-[var(--dim)]">time</span><span>{battle.submission_b.time_elapsed}</span></div>}
              </div>
            </div>
          </div>

          {/* AI Referee Breakdown */}
          {hasRealBreakdown(battle.submission_a.ai_breakdown, battle.submission_b.ai_breakdown) && (
            <div>
              <div className="text-[var(--muted)] font-bold mb-1.5">AI referee breakdown</div>
              <div className="grid grid-cols-2 gap-3">
                {isRealBreakdown(battle.submission_a.ai_breakdown) && (
                  <pre className="text-[var(--dim)] whitespace-pre-wrap">{formatBreakdown(battle.submission_a.ai_breakdown)}</pre>
                )}
                {isRealBreakdown(battle.submission_b.ai_breakdown) && (
                  <pre className="text-[var(--dim)] whitespace-pre-wrap">{formatBreakdown(battle.submission_b.ai_breakdown)}</pre>
                )}
              </div>
            </div>
          )}

          {/* Challenge Prompt */}
          {battle.challenge.prompt && (
            <div>
              <div className="text-[var(--muted)] font-bold mb-1.5">challenge prompt</div>
              <pre className="text-[var(--dim)] whitespace-pre-wrap leading-relaxed">{battle.challenge.prompt}</pre>
            </div>
          )}
        </div>
      )}
    </div>
    </>
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
