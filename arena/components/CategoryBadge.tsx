import { Category } from '@/lib/types';

const categoryConfig: Record<Category, { icon: string; color: string }> = {
  Games: { icon: '🎮', color: 'bg-purple-500/20 text-purple-400' },
  Tools: { icon: '🔧', color: 'bg-blue-500/20 text-blue-400' },
  Data: { icon: '📊', color: 'bg-green-500/20 text-green-400' },
  Research: { icon: '🔬', color: 'bg-cyan-500/20 text-cyan-400' },
  Redesign: { icon: '🎨', color: 'bg-pink-500/20 text-pink-400' },
};

export default function CategoryBadge({ category }: { category: Category }) {
  const config = categoryConfig[category];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
      <span>{config.icon}</span>
      {category}
    </span>
  );
}
