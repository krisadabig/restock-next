'use client';

import { DEFAULTS } from '@/lib/constants';

interface QuickItem {
  id: number;
  name: string;
}

interface Props {
  items: QuickItem[];
  onSelect: (itemId: number) => void;
}

export default function QuickLogStrip({ items, onSelect }: Props) {
  const visible = items.slice(0, DEFAULTS.RECENT_CHIPS_STRIP);

  if (visible.length === 0) return null;

  return (
    <div data-testid="quick-log-strip" className="px-5 pb-2 space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick log</p>
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {visible.map((item) => (
          <button
            key={item.id}
            data-testid="quick-log-chip"
            type="button"
            onClick={() => onSelect(item.id)}
            className="shrink-0 h-9 px-4 rounded-2xl text-xs font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
