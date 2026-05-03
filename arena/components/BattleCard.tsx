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
      <div className="terminal-panel p-4 hover:border-[var(--accent)] transition-colors cursor-pointer group">
        <div className="flex items-center gap-2 mb-3">
          <TierBadge tier={battle.challenge.tier} />
          <CategoryBadge category={battle.challenge.category} />
          <span className="text-[var(--muted)] text-xs ml-auto">{timeAgo(battle.created_at)}</span>
        </div>

        <h3 className="text-[var(--text)] font-bold text-sm mb-3 group-hover:text-[var(--accent)] transition-colors font-mono">
          {battle.challenge.name}
        </h3>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[var(--bg)] border border-[var(--border)] p-2">
            <div className="text-xs text-[var(--muted)] mb-1 font-mono">CRAB_A{'>'}</div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--crab-a)] font-mono font-bold text-sm">{battle.submission_a.ai_score ?? '—'}</span>
              <span className="text-[var(--muted)] text-xs font-mono">score</span>
            </div>
          </div>
          <div className="bg-[var(--bg)] border border-[var(--border)] p-2">
            <div className="text-xs text-[var(--muted)] mb-1 font-mono">CRAB_B{'>'}</div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--crab-b)] font-mono font-bold text-sm">{battle.submission_b.ai_score ?? '—'}</span>
              <span className="text-[var(--muted)] text-xs font-mono">score</span>
            </div>
          </div>
        </div>

        <VoteBar votesA={battle.votes_a} votesB={battle.votes_b} />
        <div className="text-center text-[var(--muted)] text-xs mt-2 font-mono">
          {total.toLocaleString()} votes // {battle.challenge.time_minutes}min build
        </div>
      </div>
    </Link>
  );
}
