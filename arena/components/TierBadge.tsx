import { Tier } from '@/lib/types';

const tierColors: Record<Tier, string> = {
  Bronze: 'bg-amber-900/30 text-amber-600 border-amber-800',
  Silver: 'bg-gray-500/20 text-gray-400 border-gray-600',
  Gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-600',
  Platinum: 'bg-teal-500/20 text-teal-400 border-teal-600',
  Diamond: 'bg-blue-500/20 text-blue-400 border-blue-600',
  Champion: 'bg-purple-500/20 text-purple-400 border-purple-600',
};

export default function TierBadge({ tier }: { tier: Tier | number }) {
  if (typeof tier === 'number') {
    const label = `Tier ${tier}`;
    const colors = tier <= 1
      ? 'bg-green-500/20 text-green-400 border-green-700'
      : tier === 2
      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-700'
      : 'bg-red-500/20 text-red-400 border-red-700';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors}`}>
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${tierColors[tier]}`}>
      {tier}
    </span>
  );
}
