'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import SpendBarChart from './SpendBarChart';
import ItemComparisonTable from './ItemComparisonTable';
import type { ItemRow } from './ItemComparisonTable';
import type { Category, Item, Entry } from '@/lib/db/schema';

interface MonthlySpend {
  month: string;
  total: number;
}

interface Props {
  category: Category;
  items: Item[];
  purchaseEntries: Entry[];
  monthlySpend: MonthlySpend[];
}

function currentYYYYMM(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function prevYYYYMM(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, '0')}`;
}

function currentYear(): string {
  return String(new Date().getFullYear());
}

export default function CategoryClient({ category, items, purchaseEntries, monthlySpend }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  const comparisonRows = useMemo((): ItemRow[] => {
    return items.map((item) => {
      const purchases = purchaseEntries.filter(
        (e) => e.itemId === item.id && e.price != null,
      );
      if (purchases.length === 0) return { item, avgPrice: null, bestPrice: null };
      const prices = purchases.map((e) => e.price as number);
      const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
      const best = Math.min(...prices);
      return { item, avgPrice: avg, bestPrice: best };
    });
  }, [items, purchaseEntries]);

  const thisMonthKey = currentYYYYMM();
  const lastMonthKey = prevYYYYMM(thisMonthKey);
  const yearPrefix = currentYear();

  const spendByMonth = useMemo(
    () => Object.fromEntries(monthlySpend.map((d) => [d.month, d.total])),
    [monthlySpend],
  );

  const thisMonthTotal = spendByMonth[thisMonthKey] ?? 0;
  const lastMonthTotal = spendByMonth[lastMonthKey] ?? 0;
  const thisYearTotal = monthlySpend
    .filter((d) => d.month.startsWith(yearPrefix))
    .reduce((s, d) => s + d.total, 0);

  return (
    <div className="pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-secondary/60 transition-all shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 data-testid="category-name" className="font-bold text-lg text-foreground truncate leading-tight">
            {category.name}
          </h1>
        </div>
      </header>

      <div className="px-5 py-5 space-y-6">
        {/* Items comparison */}
        <section data-testid="comparison-section" className="glass-card rounded-[1.75rem] p-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t('app.itemsInCategory')}
          </p>
          {items.length === 0 ? (
            <p data-testid="no-items-state" className="py-6 text-sm text-muted-foreground text-center">
              {t('app.noPurchaseHistory')}
            </p>
          ) : (
            <ItemComparisonTable
              rows={comparisonRows}
              onItemTap={(id) => router.push(`/app/item/${id}`)}
            />
          )}
        </section>

        {/* Total spend */}
        <section data-testid="spend-section" className="glass-card rounded-[1.75rem] p-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t('app.totalSpend')}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('app.thisMonth')}</span>
              <span data-testid="spend-this-month" className="text-sm font-bold text-foreground">
                ฿{thisMonthTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('app.lastMonth')}</span>
              <span data-testid="spend-last-month" className="text-sm font-semibold text-foreground">
                ฿{lastMonthTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('app.thisYear')}</span>
              <span data-testid="spend-this-year" className="text-sm font-semibold text-foreground">
                ฿{thisYearTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Spend over time */}
        {monthlySpend.length > 0 && (
          <section data-testid="chart-section" className="glass-card rounded-[1.75rem] p-5 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('app.spendOverTime')}
            </p>
            <SpendBarChart data={monthlySpend} />
          </section>
        )}
      </div>
    </div>
  );
}
