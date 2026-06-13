'use client';

interface Props {
  categoryId: number;
  categoryName: string;
  total: number;
  maxTotal: number;
  onTap: (categoryId: number) => void;
}

export default function CategorySpendRow({ categoryId, categoryName, total, maxTotal, onTap }: Props) {
  const widthPct = maxTotal > 0 ? `${Math.round((total / maxTotal) * 100)}%` : '0%';

  return (
    <button
      type="button"
      onClick={() => onTap(categoryId)}
      className="w-full flex items-center gap-3 py-2.5 hover:bg-secondary/30 rounded-xl px-1 transition-colors text-left"
    >
      <span className="w-32 shrink-0 text-sm font-medium text-foreground truncate">
        {categoryName}
      </span>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
          <div
            data-testid="spend-bar"
            className="h-full bg-primary/70 rounded-full transition-all duration-500"
            style={{ width: widthPct }}
          />
        </div>
        <span data-testid="spend-amount" className="text-sm font-bold text-foreground w-16 text-right">
          ฿{total.toLocaleString()}
        </span>
      </div>
    </button>
  );
}
