import Link from 'next/link';
import { Battle } from '@/lib/types';
import TierBadge from './TierBadge';
import CategoryBadge from './CategoryBadge';
import VoteBar from './VoteBar';

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1d ago';
  return `${diffDays}d ago`;
}

export default function BattleCard({ battle }: { battle: Battle }) {
  const total = battle.votes_a + battle.votes_b;

  return (
    <Link href={`/battles/${battle.id}`}>
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#FF6B35]/50 transition-all duration-200 cursor-pointer group">
        <div className="flex items-center gap-2 mb-3">
          <TierBadge tier={battle.challenge.tier} />
          <CategoryBadge category={battle.challenge.category} />
          <span className="text-[#888] text-xs ml-auto">{timeAgo(battle.created_at)}</span>
        </div>

        <h3 className="text-white font-semibold text-lg mb-3 group-hover:text-[#FF6B35] transition-colors">
          {battle.challenge.name}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#2a2a2a]">
            <div className="text-xs text-[#888] mb-1">Crab A</div>
            <div className="flex items-center justify-between">
              <span className="text-[#FF6B35] font-mono font-bold">{battle.submission_a.ai_score}</span>
              <span className="text-[#888] text-xs">AI Score</span>
            </div>
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#2a2a2a]">
            <div className="text-xs text-[#888] mb-1">Crab B</div>
            <div className="flex items-center justify-between">
              <span className="text-[#00D4AA] font-mono font-bold">{battle.submission_b.ai_score}</span>
              <span className="text-[#888] text-xs">AI Score</span>
            </div>
          </div>
        </div>

        <VoteBar votesA={battle.votes_a} votesB={battle.votes_b} />
        <div className="text-center text-[#888] text-xs mt-2">
          {total.toLocaleString()} votes · {battle.challenge.time_minutes} min build
        </div>
      </div>
    </Link>
  );
}
