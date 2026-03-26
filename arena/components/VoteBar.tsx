'use client';

export default function VoteBar({ votesA, votesB }: { votesA: number; votesB: number }) {
  const total = votesA + votesB;
  const pctA = total > 0 ? Math.round((votesA / total) * 100) : 50;
  const pctB = total > 0 ? 100 - pctA : 50;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#FF6B35] font-semibold">{pctA}% Crab A</span>
        <span className="text-[#888]">{total.toLocaleString()} votes</span>
        <span className="text-[#00D4AA] font-semibold">Crab B {pctB}%</span>
      </div>
      <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden flex">
        <div
          className="h-full bg-[#FF6B35] transition-all duration-700 ease-out rounded-l-full"
          style={{ width: `${pctA}%` }}
        />
        <div
          className="h-full bg-[#00D4AA] transition-all duration-700 ease-out rounded-r-full"
          style={{ width: `${pctB}%` }}
        />
      </div>
    </div>
  );
}
