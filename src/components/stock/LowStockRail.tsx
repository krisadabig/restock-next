'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import StockItemCard from './StockItemCard';
import { stockStatus } from '@/lib/stock';
import type { Item, Entry } from '@/lib/db/schema';

interface StockEntry {
  item: Item;
  lastEntry: Entry | null;
}

interface Props {
  items: StockEntry[];
  onItemTap: (item: Item) => void;
}

export default function LowStockRail({ items, onItemTap }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const urgent = items.filter(({ item }) => {
    const s = stockStatus(item);
    return s === 'out' || s === 'low';
  });

  if (urgent.length === 0) return null;

  const outCount = urgent.filter(({ item }) => item.currentStock <= 0).length;
  const lowCount = urgent.length - outCount;

  return (
    <div data-testid="low-stock-rail" className="space-y-2">
      <button
        data-testid="rail-toggle"
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 glass-card rounded-2xl"
      >
        <div className="flex items-center gap-3 text-sm font-bold">
          {outCount > 0 && (
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {t('app.filterOutOfStock')} ({outCount})
            </span>
          )}
          {lowCount > 0 && (
            <span className="flex items-center gap-1.5 text-amber-500">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              {t('app.filterLow')} ({lowCount})
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="space-y-2 pl-1">
          {urgent.map(({ item, lastEntry }) => (
            <StockItemCard
              key={item.id}
              item={item}
              lastEntry={lastEntry}
              onTap={() => onItemTap(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
