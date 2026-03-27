'use client';

export default function VoteBar({ votesA, votesB }: { votesA: number; votesB: number }) {
  const total = votesA + votesB;
  const pctA = total > 0 ? Math.round((votesA / total) * 100) : 50;
  const pctB = total > 0 ? 100 - pctA : 50;

  const barWidth = 20;
  const fillA = Math.round((pctA / 100) * barWidth);
  const fillB = barWidth - fillA;

  return (
    <div className="flex items-center gap-1.5 text-[10px]" style={{ letterSpacing: '-1px' }}>
      <span className="text-[var(--crab-a)]" style={{ letterSpacing: 0 }}>{pctA}</span>
      <span className="text-[var(--crab-a)]">{'█'.repeat(fillA)}</span>
      <span className="text-[var(--crab-b)]">{'█'.repeat(fillB)}</span>
      <span className="text-[var(--crab-b)]" style={{ letterSpacing: 0 }}>{pctB}</span>
      <span className="text-[var(--dim)]" style={{ letterSpacing: 0 }}>{total.toLocaleString()}</span>
    </div>
  );
}
