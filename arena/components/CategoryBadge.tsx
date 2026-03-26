const categoryLabels: Record<string, string> = {
  Games: 'GAME',
  Tools: 'TOOL',
  Data: 'DATA',
  Research: 'RESEARCH',
  Redesign: 'REDESIGN',
};

export default function CategoryBadge({ category }: { category: string }) {
  const label = categoryLabels[category] || category.toUpperCase();
  return (
    <span className="text-[var(--accent)] text-xs font-mono border border-[var(--accent)]/30 px-1.5 py-0.5">
      [{label}]
    </span>
  );
}
