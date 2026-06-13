'use client';

import { useTranslation } from '@/lib/i18n';
import type { StockStatus } from '@/lib/stock';

interface Props {
  status: StockStatus;
}

const config: Record<StockStatus, { dot: string; label: string; text: string }> = {
  ok:  { dot: 'bg-emerald-500', label: 'text-emerald-600 dark:text-emerald-400', text: 'ok' },
  low: { dot: 'bg-amber-400',   label: 'text-amber-600 dark:text-amber-400',     text: 'low' },
  out: { dot: 'bg-red-500',     label: 'text-red-600 dark:text-red-400',         text: 'out' },
};

export default function StockStatusBadge({ status }: Props) {
  const { t } = useTranslation();
  const { dot, label } = config[status];

  const labelText =
    status === 'ok'  ? t('app.inStock') :
    status === 'low' ? t('app.stockLow') :
                       t('app.stockOut');

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${label}`}>
      <span data-dot className={`h-2 w-2 rounded-full ${dot}`} />
      {labelText}
    </span>
  );
}
