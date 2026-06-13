'use client';

interface Props {
  lastPrice: number;
  avgPrice: number;
}

export default function DealSignalBadge({ lastPrice, avgPrice }: Props) {
  if (lastPrice >= avgPrice || avgPrice === 0) return null;

  const pct = Math.round(((avgPrice - lastPrice) / avgPrice) * 100);

  return (
    <div
      data-testid="deal-signal"
      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl"
    >
      <span>฿</span>
      <span>{pct}% below your avg ✓</span>
    </div>
  );
}
