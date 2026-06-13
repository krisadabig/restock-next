'use client';

import { useTranslation } from '@/lib/i18n';

interface StoreRow {
  store: string;
  total: number;
  count: number;
}

interface Props {
  stores: StoreRow[];
}

export default function StoreBreakdown({ stores }: Props) {
  const { t } = useTranslation();

  if (stores.length === 0) {
    return (
      <p data-testid="no-stores" className="py-4 text-sm text-muted-foreground text-center">
        {t('app.noSpendData')}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {stores.map(({ store, total, count }) => (
        <div key={store} className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0">
          <span className="text-sm font-medium text-foreground">{store}</span>
          <div className="flex items-center gap-3">
            <span
              data-testid={`store-count-${store}`}
              className="text-xs text-muted-foreground"
            >
              {count} {t('app.visits')}
            </span>
            <span
              data-testid={`store-total-${store}`}
              className="text-sm font-bold text-foreground w-20 text-right"
            >
              ฿{total.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
