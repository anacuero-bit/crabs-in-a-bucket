'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { fetchBattle, castVote, API_BASE } from '@/lib/api';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-[#2a2a2a] rounded w-24 mb-4" />
          <div className="h-8 bg-[#2a2a2a] rounded w-2/3 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="h-[500px] bg-[#141414] border border-[#2a2a2a] rounded-xl" />
            <div className="h-[500px] bg-[#141414] border border-[#2a2a2a] rounded-xl" />
          </div>
          <div className="h-32 bg-[#141414] border border-[#2a2a2a] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !battle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{error || 'Battle not found'}</h1>
        <div className="flex justify-center gap-4">
          <Link href="/battles" className="text-[#FF6B35] hover:underline">
            Back to Battles
          </Link>
          <button
            onClick={() => { setLoading(true); setError(null); fetchBattle(id).then((data) => { setBattle(data); setVotesA(data.votes_a); setVotesB(data.votes_b); setLoading(false); }).catch((err) => { setError(err.message); setLoading(false); }); }}
            className="text-[#00D4AA] hover:underline"
          >
            Retry
          </button>
        </div>
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
      setVoteError('Failed to record vote. It may not have been saved.');
    }
  };

  const iframeSrcA = `${API_BASE}/api/files/submissions/${battle.submission_a.id}/index.html`;
  const iframeSrcB = `${API_BASE}/api/files/submissions/${battle.submission_b.id}/index.html`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/battles" className="text-[#888] hover:text-white text-sm mb-4 inline-block">
          &larr; Back to Battles
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {battle.challenge.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <TierBadge tier={battle.challenge.tier} />
          <CategoryBadge category={battle.challenge.category} />
          <span className="text-[#888] text-sm">{battle.challenge.time_minutes} min build</span>
        </div>
      </div>

      {/* Side-by-side iframes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Crab A */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[#FF6B35] font-bold text-lg">CRAB A</span>
              <span className="text-[#888] text-xs px-2 py-0.5 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                {battle.submission_a.harness}
              </span>
              <span className="text-[#888] text-xs px-2 py-0.5 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                {battle.submission_a.model}
              </span>
              {clickedA && (
                <span className="text-green-400 text-xs">&#10003; Viewed</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#888] text-sm">AI Score:</span>
              <span className="text-[#FF6B35] font-mono font-bold text-lg">
                {battle.submission_a.ai_score}
              </span>
            </div>
          </div>
          <div
            className={`bg-[#141414] border rounded-xl overflow-hidden ${
              clickedA ? 'border-[#FF6B35]/50' : 'border-[#2a2a2a]'
            }`}
            onClick={() => setClickedA(true)}
          >
            <iframe
              src={iframeSrcA}
              className="w-full h-[500px] lg:h-[600px]"
              sandbox="allow-scripts allow-same-origin"
              title="Crab A Submission"
              onLoad={() => setClickedA(true)}
            />
          </div>
        </div>

        {/* Crab B */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[#00D4AA] font-bold text-lg">CRAB B</span>
              <span className="text-[#888] text-xs px-2 py-0.5 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                {battle.submission_b.harness}
              </span>
              <span className="text-[#888] text-xs px-2 py-0.5 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                {battle.submission_b.model}
              </span>
              {clickedB && (
                <span className="text-green-400 text-xs">&#10003; Viewed</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#888] text-sm">AI Score:</span>
              <span className="text-[#00D4AA] font-mono font-bold text-lg">
                {battle.submission_b.ai_score}
              </span>
            </div>
          </div>
          <div
            className={`bg-[#141414] border rounded-xl overflow-hidden ${
              clickedB ? 'border-[#00D4AA]/50' : 'border-[#2a2a2a]'
            }`}
            onClick={() => setClickedB(true)}
          >
            <iframe
              src={iframeSrcB}
              className="w-full h-[500px] lg:h-[600px]"
              sandbox="allow-scripts allow-same-origin"
              title="Crab B Submission"
              onLoad={() => setClickedB(true)}
            />
          </div>
        </div>
      </div>

      {/* Voting Section */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-center mb-4">Which crab wins?</h2>

        {!clickedA || !clickedB ? (
          <p className="text-[#888] text-center text-sm mb-4">
            Interact with both submissions before voting.
          </p>
        ) : null}

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => handleVote('A')}
            disabled={!canVote}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
              voted === 'A'
                ? 'bg-[#FF6B35] text-white scale-105'
                : canVote
                ? 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35] hover:bg-[#FF6B35] hover:text-white'
                : 'bg-[#1a1a1a] text-[#555] cursor-not-allowed border border-[#2a2a2a]'
            }`}
          >
            {voted === 'A' ? 'Voted A!' : 'Vote Crab A'}
          </button>
          <button
            onClick={() => handleVote('B')}
            disabled={!canVote}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
              voted === 'B'
                ? 'bg-[#00D4AA] text-white scale-105'
                : canVote
                ? 'bg-[#00D4AA]/20 text-[#00D4AA] border border-[#00D4AA] hover:bg-[#00D4AA] hover:text-white'
                : 'bg-[#1a1a1a] text-[#555] cursor-not-allowed border border-[#2a2a2a]'
            }`}
          >
            {voted === 'B' ? 'Voted B!' : 'Vote Crab B'}
          </button>
        </div>

        {voteError && (
          <p className="text-red-400 text-center text-sm mb-4">{voteError}</p>
        )}

        <VoteBar votesA={votesA} votesB={votesB} />
      </div>

      {/* Under the Hood */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden mb-6">
        <button
          onClick={() => setHoodExpanded(!hoodExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors"
        >
          <span className="font-semibold">Under the Hood</span>
          <svg
            className={`w-5 h-5 text-[#888] transition-transform ${
              hoodExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {hoodExpanded && (
          <div className="px-4 pb-4 border-t border-[#2a2a2a]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {/* Crab A Info */}
              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
                <h3 className="text-[#FF6B35] font-semibold mb-3">Crab A Stack</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#888]">Model</span>
                    <span className="text-white">{battle.submission_a.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Harness</span>
                    <span className="text-white">{battle.submission_a.harness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">AI Score</span>
                    <span className="text-[#FF6B35] font-mono">{battle.submission_a.ai_score}</span>
                  </div>
                  {battle.submission_a.time_elapsed != null && (
                    <div className="flex justify-between">
                      <span className="text-[#888]">Time Elapsed</span>
                      <span className="text-white">{Math.round(battle.submission_a.time_elapsed / 60)}m {battle.submission_a.time_elapsed % 60}s</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Crab B Info */}
              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
                <h3 className="text-[#00D4AA] font-semibold mb-3">Crab B Stack</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#888]">Model</span>
                    <span className="text-white">{battle.submission_b.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Harness</span>
                    <span className="text-white">{battle.submission_b.harness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">AI Score</span>
                    <span className="text-[#00D4AA] font-mono">{battle.submission_b.ai_score}</span>
                  </div>
                  {battle.submission_b.time_elapsed != null && (
                    <div className="flex justify-between">
                      <span className="text-[#888]">Time Elapsed</span>
                      <span className="text-white">{Math.round(battle.submission_b.time_elapsed / 60)}m {battle.submission_b.time_elapsed % 60}s</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Breakdown */}
            {(battle.submission_a.ai_breakdown || battle.submission_b.ai_breakdown) && (
              <div className="mt-4 bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
                <h3 className="text-white font-semibold mb-3">AI Referee Score Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {battle.submission_a.ai_breakdown && (
                    <div>
                      <h4 className="text-[#FF6B35] text-sm font-medium mb-2">Crab A</h4>
                      <pre className="text-[#888] text-xs whitespace-pre-wrap font-sans leading-relaxed">
                        {battle.submission_a.ai_breakdown}
                      </pre>
                    </div>
                  )}
                  {battle.submission_b.ai_breakdown && (
                    <div>
                      <h4 className="text-[#00D4AA] text-sm font-medium mb-2">Crab B</h4>
                      <pre className="text-[#888] text-xs whitespace-pre-wrap font-sans leading-relaxed">
                        {battle.submission_b.ai_breakdown}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Source link placeholder */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[#555] text-sm cursor-not-allowed">View source on GitHub</span>
              <span className="text-[#888] text-xs bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#2a2a2a]">Coming soon</span>
            </div>
          </div>
        )}
      </div>

      {/* Challenge Prompt */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <button
          onClick={() => setPromptExpanded(!promptExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors"
        >
          <span className="font-semibold">Challenge Prompt</span>
          <svg
            className={`w-5 h-5 text-[#888] transition-transform ${
              promptExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {promptExpanded && (
          <div className="px-4 pb-4 border-t border-[#2a2a2a]">
            <pre className="text-[#888] text-sm whitespace-pre-wrap pt-4 font-sans leading-relaxed">
              {battle.challenge.prompt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
