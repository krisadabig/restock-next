'use client';

import { useTranslation } from '@/lib/i18n';
import type { Item } from '@/lib/db/schema';

export interface ItemRow {
  item: Item;
  avgPrice: number | null;
  bestPrice: number | null;
}

interface Props {
  rows: ItemRow[];
  onItemTap: (itemId: number) => void;
}

export default function ItemComparisonTable({ rows, onItemTap }: Props) {
  const { t } = useTranslation();

  const cheapestId = (() => {
    const withPrice = rows.filter((r) => r.avgPrice != null);
    if (withPrice.length < 2) return null;
    return withPrice.reduce((a, b) => (a.avgPrice! < b.avgPrice! ? a : b)).item.id;
  })();

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center gap-2 px-1 pb-2 border-b border-border/30">
        <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Item
        </span>
        <span className="w-16 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {t('app.avg')}
        </span>
        <span className="w-16 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {t('app.best')}
        </span>
      </div>

      {/* Item rows */}
      {rows.map(({ item, avgPrice, bestPrice }) => (
        <button
          key={item.id}
          data-testid={`item-row-${item.id}`}
          type="button"
          onClick={() => onItemTap(item.id)}
          className="w-full flex items-center gap-2 py-3 border-b border-border/20 last:border-0 hover:bg-secondary/30 transition-colors rounded-xl px-1 text-left"
        >
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
            {item.id === cheapestId && (
              <span
                data-testid={`cheapest-badge-${item.id}`}
                className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-md px-1.5 py-0.5"
              >
                {t('app.cheapestPerUnit')}
              </span>
            )}
          </div>
          <span
            data-testid={`avg-${item.id}`}
            className="w-16 text-right text-sm font-semibold text-foreground"
          >
            {avgPrice != null ? `฿${Math.round(avgPrice)}` : '—'}
          </span>
          <span
            data-testid={`best-${item.id}`}
            className="w-16 text-right text-sm text-muted-foreground"
          >
            {bestPrice != null ? `฿${bestPrice}` : '—'}
          </span>
        </button>
      ))}
    </div>
  );
}
