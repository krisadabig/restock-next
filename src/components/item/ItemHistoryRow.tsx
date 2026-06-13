'use client';

import { Edit2, ShoppingBag, ArrowDownRight } from 'lucide-react';
import { ENTRY_TYPE } from '@/lib/constants';
import SaleFlagBadge from './SaleFlagBadge';
import type { Entry } from '@/lib/db/schema';

interface Props {
  entry: Entry;
  itemAvgPrice: number;
  onEdit: (entry: Entry) => void;
}

export default function ItemHistoryRow({ entry, itemAvgPrice, onEdit }: Props) {
  const isPurchase = entry.type === ENTRY_TYPE.PURCHASE;

  const dateLabel = new Date(entry.date).toLocaleDateString('default', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div data-testid="history-row" className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
      {/* Type icon */}
      <div
        data-testid="entry-type-icon"
        data-type={entry.type}
        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
          isPurchase
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
        }`}
      >
        {isPurchase
          ? <ShoppingBag size={16} strokeWidth={2.5} />
          : <ArrowDownRight size={16} strokeWidth={2.5} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-sm">
            {entry.quantity} {entry.unit}
          </span>
          {isPurchase && entry.price != null && (
            <span className="text-sm text-muted-foreground">฿{entry.price}</span>
          )}
          {isPurchase && entry.store && (
            <span className="text-sm text-muted-foreground">· {entry.store}</span>
          )}
          {isPurchase && entry.price != null && itemAvgPrice > 0 && (
            <SaleFlagBadge price={entry.price} avgPrice={itemAvgPrice} />
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">{dateLabel}</p>
        {entry.note && (
          <p data-testid="entry-note" className="text-xs text-muted-foreground/70 mt-1 italic">
            {entry.note}
          </p>
        )}
      </div>

      {/* Edit button */}
      <button
        data-testid="edit-entry-btn"
        type="button"
        onClick={() => onEdit(entry)}
        className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-90 shrink-0"
      >
        <Edit2 size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
