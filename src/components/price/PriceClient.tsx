'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import TimeRangeSelector, { type TimeRange } from './TimeRangeSelector';
import CategorySpendRow from './CategorySpendRow';
import StoreBreakdown from './StoreBreakdown';
import RecentPurchaseRow from './RecentPurchaseRow';
import type { Entry } from '@/lib/db/schema';

interface CategorySpendItem {
  categoryId: number;
  categoryName: string;
  total: number;
}

interface RecentPurchase {
  entry: Entry;
  itemId: number;
  itemName: string;
  categoryName: string | null;
}

interface StoreItem {
  store: string;
  total: number;
  count: number;
}

interface Props {
  range: TimeRange;
  totalSpend: { current: number; previous: number };
  categorySpend: CategorySpendItem[];
  recentPurchases: RecentPurchase[];
  storeSpend: StoreItem[];
}

export default function PriceClient({
  range,
  totalSpend,
  categorySpend,
  recentPurchases,
  storeSpend,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  const isEmpty = totalSpend.current === 0 && categorySpend.length === 0;

  const maxCategoryTotal = categorySpend.length > 0
    ? Math.max(...categorySpend.map((c) => c.total))
    : 0;

  const delta = totalSpend.previous > 0
    ? Math.round(((totalSpend.current - totalSpend.previous) / totalSpend.previous) * 100)
    : null;

  return (
    <div className="pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-5 py-4 space-y-3">
        <h1 className="font-bold text-lg text-foreground">{t('app.navPrice')}</h1>
        <TimeRangeSelector
          value={range}
          onChange={(r) => router.push(`/app/price?range=${r}`)}
        />
      </header>

      <div className="px-5 py-5 space-y-6">
        {isEmpty ? (
          <div data-testid="no-spend" className="py-16 text-center">
            <p className="text-sm text-muted-foreground">{t('app.priceScreenEmpty')}</p>
          </div>
        ) : (
          <>
            {/* Total spend */}
            <section className="glass-card rounded-[1.75rem] p-5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('app.totalSpend')}
              </p>
              <div className="flex items-end gap-3">
                <span data-testid="total-spend" className="text-4xl font-black text-foreground">
                  ฿{totalSpend.current.toLocaleString()}
                </span>
                {delta !== null && (
                  <span className={`text-sm font-semibold mb-1 ${delta > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}% {t('app.vsLastPeriod')}
                  </span>
                )}
              </div>
            </section>

            {/* By Category */}
            <section data-testid="category-section" className="glass-card rounded-[1.75rem] p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('app.byCategory')}
              </p>
              {categorySpend.map((item) => (
                <CategorySpendRow
                  key={item.categoryId}
                  categoryId={item.categoryId}
                  categoryName={item.categoryName}
                  total={item.total}
                  maxTotal={maxCategoryTotal}
                  onTap={(id) => router.push(`/app/category/${id}`)}
                />
              ))}
            </section>

            {/* Recent Purchases */}
            <section data-testid="recent-section" className="glass-card rounded-[1.75rem] p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('app.recentPurchases')}
              </p>
              {recentPurchases.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground text-center">{t('app.noResults')}</p>
              ) : (
                recentPurchases.map(({ entry, itemId, itemName }) => (
                  <RecentPurchaseRow
                    key={entry.id}
                    itemId={itemId}
                    itemName={itemName}
                    price={entry.price}
                    store={entry.store}
                    quantity={entry.quantity}
                    unit={entry.unit}
                    date={entry.date}
                    onTap={(id) => router.push(`/app/item/${id}`)}
                  />
                ))
              )}
            </section>

            {/* Stores */}
            <section data-testid="stores-section" className="glass-card rounded-[1.75rem] p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('app.stores')}
              </p>
              <StoreBreakdown stores={storeSpend} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
