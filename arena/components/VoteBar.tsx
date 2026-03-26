'use client';

export default function VoteBar({ votesA, votesB }: { votesA: number; votesB: number }) {
  const total = votesA + votesB;
  const pctA = total > 0 ? Math.round((votesA / total) * 100) : 50;
  const pctB = total > 0 ? 100 - pctA : 50;

  const barWidth = 20;
  const fillA = Math.round((pctA / 100) * barWidth);
  const fillB = barWidth - fillA;

  return (
    <div className="w-full font-mono">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--crab-a)]">{pctA}% A</span>
        <span className="text-[var(--muted)]">{total.toLocaleString()} votes</span>
        <span className="text-[var(--crab-b)]">B {pctB}%</span>
      </div>
      <div className="text-xs flex items-center gap-1">
        <span className="text-[var(--muted)]">[</span>
        <span className="text-[var(--crab-a)]">{'█'.repeat(fillA)}</span>
        <span className="text-[var(--crab-b)]">{'█'.repeat(fillB)}</span>
        <span className="text-[var(--muted)]">]</span>
      </div>
    </div>
  );
}
