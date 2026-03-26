import { Tier } from '@/lib/types';

export default function TierBadge({ tier }: { tier: Tier | number }) {
  const label = typeof tier === 'number' ? `T${tier}` : tier ? tier.toUpperCase() : '???';
  return (
    <span className="text-[var(--muted)] text-xs font-mono border border-[var(--border)] px-1.5 py-0.5">
      [{label}]
    </span>
  );
}
