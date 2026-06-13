'use client';

interface Props {
  itemId: number;
  itemName: string;
  price: number | null;
  store: string | null;
  quantity: number;
  unit: string;
  date: string;
  onTap: (itemId: number) => void;
}

export default function RecentPurchaseRow({ itemId, itemName, price, store, quantity, unit, date, onTap }: Props) {
  const dateLabel = new Date(date).toLocaleDateString('default', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <button
      type="button"
      onClick={() => onTap(itemId)}
      className="w-full flex items-start gap-3 py-3 border-b border-border/20 last:border-0 hover:bg-secondary/30 rounded-xl px-1 transition-colors text-left"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{itemName}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {price != null && (
            <span data-testid="purchase-price" className="text-xs text-muted-foreground">
              ฿{price}
            </span>
          )}
          {store && (
            <span data-testid="purchase-store" className="text-xs text-muted-foreground">
              · {store}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            · {quantity} {unit}
          </span>
        </div>
      </div>
      <span data-testid="purchase-date" className="text-[11px] text-muted-foreground shrink-0 mt-0.5">
        {dateLabel}
      </span>
    </button>
  );
}
