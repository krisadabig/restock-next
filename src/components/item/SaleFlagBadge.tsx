'use client';

import { THRESHOLDS } from '@/lib/constants';

interface Props {
  price: number;
  avgPrice: number;
}

export default function SaleFlagBadge({ price, avgPrice }: Props) {
  if (avgPrice === 0 || price / avgPrice > THRESHOLDS.SALE_FLAG_RATIO) return null;

  return (
    <span
      data-testid="sale-flag"
      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg"
      title="Sale price"
    >
      🏷️
    </span>
  );
}
