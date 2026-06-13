'use client';

import { useTranslation } from '@/lib/i18n';
import StockStatusBadge from './StockStatusBadge';
import { stockStatus } from '@/lib/stock';
import type { Item, Entry } from '@/lib/db/schema';

interface Props {
  item: Item;
  lastEntry: Entry | null;
  onTap: () => void;
  partnerTag?: string;
}

export default function StockItemCard({ item, lastEntry, onTap, partnerTag }: Props) {
  const { t } = useTranslation();
  const status = stockStatus(item);

  const lastEntryText = lastEntry
    ? [
        lastEntry.price != null ? `฿${lastEntry.price}` : null,
        lastEntry.store,
        new Date(lastEntry.date).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      ].filter(Boolean).join(' · ')
    : null;

  return (
    <button
      data-testid="stock-item-card"
      type="button"
      onClick={onTap}
      className="w-full glass-card rounded-[1.75rem] p-5 flex items-start justify-between gap-4 text-left hover:shadow-2xl active:scale-[0.98] transition-all"
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-base text-foreground leading-snug truncate">{item.name}</h3>

        <div data-testid="stock-qty" className="flex items-center gap-2 mt-1">
          <span className="text-2xl font-black text-foreground">{item.currentStock}</span>
          <span className="text-sm text-muted-foreground font-medium">{item.unit}</span>
          <StockStatusBadge status={status} />
        </div>

        <p data-testid="last-entry" className="text-xs text-muted-foreground mt-1.5">
          {lastEntryText ?? t('app.noPurchasesYet')}
          {partnerTag && (
            <span data-testid="partner-tag" className="ml-2 text-muted-foreground/60">
              {partnerTag}
            </span>
          )}
        </p>
      </div>
    </button>
  );
}
