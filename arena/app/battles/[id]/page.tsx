'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { fetchBattle, castVote, API_BASE, isRealBreakdown, hasRealBreakdown } from '@/lib/api';
import TierBadge from '@/components/TierBadge';
import CategoryBadge from '@/components/CategoryBadge';
import VoteBar from '@/components/VoteBar';
import { Battle } from '@/lib/types';

export default function BattleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clickedA, setClickedA] = useState(false);
  const [clickedB, setClickedB] = useState(false);
  const [voted, setVoted] = useState<'A' | 'B' | null>(null);
  const [votesA, setVotesA] = useState(0);
  const [votesB, setVotesB] = useState(0);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [hoodExpanded, setHoodExpanded] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  useEffect(() => {
    fetchBattle(id)
      .then((data) => {
        setBattle(data);
        setVotesA(data.votes_a);
        setVotesB(data.votes_b);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-4">
        <div className="animate-pulse font-mono">
          <div className="h-3 bg-[var(--border)] w-24 mb-4" />
          <div className="h-5 bg-[var(--border)] w-2/3 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="h-[500px] terminal-panel" />
            <div className="h-[500px] terminal-panel" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !battle) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-12 text-center font-mono">
        <p className="text-red-400 text-sm mb-3">ERROR: {error || 'Battle not found'}</p>
        <Link href="/" className="text-[var(--accent)] text-xs hover:underline">{'>'} back to battles</Link>
      </div>
    );
  }

  const canVote = clickedA && clickedB && !voted;

  const handleVote = async (side: 'A' | 'B') => {
    if (!canVote) return;
    setVoted(side);
    if (side === 'A') setVotesA((v) => v + 1);
    else setVotesB((v) => v + 1);
    try {
      await castVote(battle.id, side);
    } catch {
      setVoteError('Failed to record vote.');
    }
  };

  const iframeSrcA = `${API_BASE}/api/files/submissions/${battle.submission_a.id}/index.html`;
  const iframeSrcB = `${API_BASE}/api/files/submissions/${battle.submission_b.id}/index.html`;

  return (
    <div className="max-w-6xl mx-auto px-5 py-4 font-mono">
      {/* Header */}
      <div className="mb-5">
        <Link href="/" className="text-[var(--muted)] hover:text-[var(--accent)] text-xs mb-3 inline-block">
          {'<'} back
        </Link>
        <h1 className="text-lg font-bold text-[var(--text)] mb-2">
          {battle.challenge.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={battle.challenge.tier} />
          <CategoryBadge category={battle.challenge.category} />
          <span className="text-[var(--muted)] text-xs">{battle.challenge.time_minutes}min build</span>
        </div>
      </div>

      {/* Side-by-side iframes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Crab A */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[var(--crab-a)] font-bold text-sm">CRAB_A{'>'}</span>
              <span className="text-[var(--muted)] text-xs border border-[var(--border)] px-1">
                {battle.submission_a.harness}
              </span>
              <span className="text-[var(--muted)] text-xs border border-[var(--border)] px-1">
                {battle.submission_a.model}
              </span>
              {clickedA && <span className="text-[var(--crab-b)] text-xs">OK</span>}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[var(--muted)] text-xs">score:</span>
              <span className="text-[var(--crab-a)] font-bold">{battle.submission_a.ai_score ?? '—'}</span>
            </div>
          </div>
          <div
            className={`terminal-panel overflow-hidden ${clickedA ? 'border-[var(--crab-a)]' : ''}`}
            onClick={() => setClickedA(true)}
          >
            <div className="bg-[var(--border)] px-2 py-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500/60" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <span className="w-2 h-2 rounded-full bg-green-500/60" />
              <span className="text-[var(--muted)] text-xs ml-2">submission_a.html</span>
            </div>
            <div className="overflow-hidden" style={{ height: '60vh' }}>
              <iframe
                src={iframeSrcA}
                scrolling="no"
                className="border-0"
                style={{ width: '200%', height: '200%', transform: 'scale(0.5)', transformOrigin: 'top left' }}
                sandbox="allow-scripts allow-same-origin"
                title="Crab A Submission"
                onLoad={() => setClickedA(true)}
              />
            </div>
          </div>
        </div>

        {/* Crab B */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[var(--crab-b)] font-bold text-sm">CRAB_B{'>'}</span>
              <span className="text-[var(--muted)] text-xs border border-[var(--border)] px-1">
                {battle.submission_b.harness}
              </span>
              <span className="text-[var(--muted)] text-xs border border-[var(--border)] px-1">
                {battle.submission_b.model}
              </span>
              {clickedB && <span className="text-[var(--crab-b)] text-xs">OK</span>}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[var(--muted)] text-xs">score:</span>
              <span className="text-[var(--crab-b)] font-bold">{battle.submission_b.ai_score ?? '—'}</span>
            </div>
          </div>
          <div
            className={`terminal-panel overflow-hidden ${clickedB ? 'border-[var(--crab-b)]' : ''}`}
            onClick={() => setClickedB(true)}
          >
            <div className="bg-[var(--border)] px-2 py-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500/60" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <span className="w-2 h-2 rounded-full bg-green-500/60" />
              <span className="text-[var(--muted)] text-xs ml-2">submission_b.html</span>
            </div>
            <div className="overflow-hidden" style={{ height: '60vh' }}>
              <iframe
                src={iframeSrcB}
                scrolling="no"
                className="border-0"
                style={{ width: '200%', height: '200%', transform: 'scale(0.5)', transformOrigin: 'top left' }}
                sandbox="allow-scripts allow-same-origin"
                title="Crab B Submission"
                onLoad={() => setClickedB(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Voting */}
      <div className="terminal-panel p-5 mb-5">
        <h2 className="text-sm font-bold text-center mb-3">{'>'} WHICH CRAB WINS?</h2>

        {!clickedA || !clickedB ? (
          <p className="text-[var(--muted)] text-center text-xs mb-3">
            interact with both submissions before voting.
          </p>
        ) : null}

        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => handleVote('A')}
            disabled={!canVote}
            className={`px-6 py-2 text-sm font-bold transition-all font-mono ${
              voted === 'A'
                ? 'bg-[var(--crab-a)] text-[var(--bg)]'
                : canVote
                ? 'border border-[var(--crab-a)] text-[var(--crab-a)] hover:bg-[var(--crab-a)] hover:text-[var(--bg)]'
                : 'border border-[var(--border)] text-[var(--border)] cursor-not-allowed'
            }`}
          >
            {voted === 'A' ? 'VOTED A' : '> VOTE_A'}
          </button>
          <button
            onClick={() => handleVote('B')}
            disabled={!canVote}
            className={`px-6 py-2 text-sm font-bold transition-all font-mono ${
              voted === 'B'
                ? 'bg-[var(--crab-b)] text-[var(--bg)]'
                : canVote
                ? 'border border-[var(--crab-b)] text-[var(--crab-b)] hover:bg-[var(--crab-b)] hover:text-[var(--bg)]'
                : 'border border-[var(--border)] text-[var(--border)] cursor-not-allowed'
            }`}
          >
            {voted === 'B' ? 'VOTED B' : '> VOTE_B'}
          </button>
        </div>

        {voteError && <p className="text-red-400 text-center text-xs mb-3">{voteError}</p>}
        <VoteBar votesA={votesA} votesB={votesB} />
      </div>

      {/* Under the Hood */}
      <div className="terminal-panel mb-5">
        <button
          onClick={() => setHoodExpanded(!hoodExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-[var(--subtle)] transition-colors text-xs"
        >
          <span className="font-bold">{'>'} UNDER THE HOOD</span>
          <span className="text-[var(--muted)]">{hoodExpanded ? '[-]' : '[+]'}</span>
        </button>
        {hoodExpanded && (
          <div className="px-3 pb-3 border-t border-[var(--border)]">
            {(battle.submission_a.ai_score == null || battle.submission_b.ai_score == null) && (
              <p className="text-[var(--muted)] text-xs pt-3">
                {'>'} ai referee in development — community vote is the live signal
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
              <div className="bg-[var(--bg)] border border-[var(--border)] p-3">
                <h3 className="text-[var(--crab-a)] font-bold text-xs mb-2">CRAB_A STACK</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-[var(--muted)]">model</span><span>{battle.submission_a.model}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--muted)]">harness</span><span>{battle.submission_a.harness}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--muted)]">score</span><span className="text-[var(--crab-a)]">{battle.submission_a.ai_score ?? 'pending'}</span></div>
                  {battle.submission_a.time_elapsed != null && (
                    <div className="flex justify-between"><span className="text-[var(--muted)]">time</span><span>{battle.submission_a.time_elapsed}</span></div>
                  )}
                </div>
              </div>
              <div className="bg-[var(--bg)] border border-[var(--border)] p-3">
                <h3 className="text-[var(--crab-b)] font-bold text-xs mb-2">CRAB_B STACK</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-[var(--muted)]">model</span><span>{battle.submission_b.model}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--muted)]">harness</span><span>{battle.submission_b.harness}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--muted)]">score</span><span className="text-[var(--crab-b)]">{battle.submission_b.ai_score ?? 'pending'}</span></div>
                  {battle.submission_b.time_elapsed != null && (
                    <div className="flex justify-between"><span className="text-[var(--muted)]">time</span><span>{battle.submission_b.time_elapsed}</span></div>
                  )}
                </div>
              </div>
            </div>

            {hasRealBreakdown(battle.submission_a.ai_breakdown, battle.submission_b.ai_breakdown) && (
              <div className="mt-3 bg-[var(--bg)] border border-[var(--border)] p-3">
                <h3 className="font-bold text-xs mb-2">AI REFEREE BREAKDOWN</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {isRealBreakdown(battle.submission_a.ai_breakdown) && (
                    <div>
                      <h4 className="text-[var(--crab-a)] text-xs mb-1">CRAB_A</h4>
                      <pre className="text-[var(--muted)] text-xs whitespace-pre-wrap">
                        {typeof battle.submission_a.ai_breakdown === 'string' ? battle.submission_a.ai_breakdown : JSON.stringify(battle.submission_a.ai_breakdown, null, 2)}
                      </pre>
                    </div>
                  )}
                  {isRealBreakdown(battle.submission_b.ai_breakdown) && (
                    <div>
                      <h4 className="text-[var(--crab-b)] text-xs mb-1">CRAB_B</h4>
                      <pre className="text-[var(--muted)] text-xs whitespace-pre-wrap">
                        {typeof battle.submission_b.ai_breakdown === 'string' ? battle.submission_b.ai_breakdown : JSON.stringify(battle.submission_b.ai_breakdown, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <span className="text-[var(--border)] text-xs cursor-not-allowed">{'>'} view source on github</span>
              <span className="text-[var(--muted)] text-xs border border-[var(--border)] px-1">SOON</span>
            </div>
          </div>
        )}
      </div>

      {/* Challenge Prompt */}
      <div className="terminal-panel">
        <button
          onClick={() => setPromptExpanded(!promptExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-[var(--subtle)] transition-colors text-xs"
        >
          <span className="font-bold">{'>'} CHALLENGE PROMPT</span>
          <span className="text-[var(--muted)]">{promptExpanded ? '[-]' : '[+]'}</span>
        </button>
        {promptExpanded && (
          <div className="px-3 pb-3 border-t border-[var(--border)]">
            <pre className="text-[var(--muted)] text-xs whitespace-pre-wrap pt-3 leading-relaxed">
              {battle.challenge.prompt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
