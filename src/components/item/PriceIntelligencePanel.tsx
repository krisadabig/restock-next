'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';
import { calculatePriceStats, compareStores } from '@/lib/price';
import DealSignalBadge from './DealSignalBadge';
import type { Entry } from '@/lib/db/schema';

interface Props {
  purchases: Entry[]; // newest first, purchase type only
}

export default function PriceIntelligencePanel({ purchases }: Props) {
  const { t } = useTranslation();

  const stats = useMemo(() => calculatePriceStats(purchases), [purchases]);
  const storeStats = useMemo(() => compareStores(purchases), [purchases]);
  const storeCount = Object.keys(storeStats).length;

  if (!stats || purchases.length < 2) {
    return (
      <p data-testid="price-empty" className="text-sm text-muted-foreground">
        {t('app.logMorePurchases')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stat rows */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t('app.yourAvg')}</span>
          <span data-testid="price-avg" className="font-bold">฿{Math.round(stats.avg)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t('app.bestEver')}</span>
          <span data-testid="price-best" className="font-bold text-emerald-600 dark:text-emerald-400">
            ฿{stats.best}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t('app.lastPaid')}</span>
          <span data-testid="price-last" className="font-bold">฿{stats.last}</span>
        </div>
      </div>

      {/* Deal signal */}
      {stats.dealSignal && (
        <DealSignalBadge lastPrice={stats.last} avgPrice={stats.avg} />
      )}

      {/* Store comparison */}
      {storeCount >= 2 && (
        <div data-testid="store-comparison" className="space-y-2 pt-2 border-t border-border/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t('app.storeComparison')}
          </p>
          {Object.entries(storeStats)
            .sort((a, b) => a[1].avg - b[1].avg)
            .map(([store, s]) => (
              <div key={store} className="flex justify-between items-center text-sm">
                <span className="font-medium">{store}</span>
                <span className="text-muted-foreground">avg ฿{Math.round(s.avg)}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
