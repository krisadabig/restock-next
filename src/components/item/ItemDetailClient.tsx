'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit2, ShoppingBag, ArrowDownRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useUI } from '@/components/providers/UIContext';
import { useOffline } from '@/components/providers/OfflineContext';
import PriceIntelligencePanel from './PriceIntelligencePanel';
import ItemHistoryRow from './ItemHistoryRow';
import EditEntrySheet from '@/components/entry/EditEntrySheet';
import DeleteEntryModal from '@/components/entry/DeleteEntryModal';
import type { Item, Category, Entry } from '@/lib/db/schema';
import { ENTRY_TYPE } from '@/lib/constants';

type HistoryFilter = 'all' | 'purchase' | 'consume'; // 'all' is local-only; purchase/consume match ENTRY_TYPE

interface Props {
  item: Item;
  category: Category | null;
  allEntries: Entry[];       // all entry types, newest first
  purchaseHistory: Entry[];  // purchase only, for price stats
}

export default function ItemDetailClient({ item, category, allEntries, purchaseHistory }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { setLogEntrySheetOpen, setEditItemSheetOpen } = useUI();
  const { deleteEntryOffline } = useOffline();

  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<Entry | null>(null);

  const avgPrice = useMemo(() => {
    const valid = purchaseHistory.filter(e => e.price != null);
    if (valid.length === 0) return 0;
    return valid.reduce((s, e) => s + (e.price ?? 0), 0) / valid.length;
  }, [purchaseHistory]);

  const filteredEntries = useMemo(() => {
    if (historyFilter === ENTRY_TYPE.PURCHASE) return allEntries.filter(e => e.type === ENTRY_TYPE.PURCHASE);
    if (historyFilter === ENTRY_TYPE.CONSUME)  return allEntries.filter(e => e.type === ENTRY_TYPE.CONSUME);
    return allEntries;
  }, [allEntries, historyFilter]);

  const FILTERS: { key: HistoryFilter; label: string; testId: string }[] = [
    { key: 'all' as HistoryFilter,            label: t('app.filterAll'),  testId: 'filter-all' },
    { key: ENTRY_TYPE.PURCHASE,              label: t('app.purchase'),   testId: 'filter-purchase' },
    { key: ENTRY_TYPE.CONSUME,               label: t('app.consume'),    testId: 'filter-consume' },
  ];

  return (
    <div className="pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-secondary/60 transition-all shrink-0"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 data-testid="item-name" className="font-bold text-lg text-foreground truncate leading-tight">
              {item.name}
            </h1>
            {category && (
              <button
                data-testid="category-label"
                type="button"
                onClick={() => router.push(`/app/category/${category.id}`)}
                className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
              >
                {category.name}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setEditItemSheetOpen(true, item, allEntries.length)}
            className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-secondary/60 transition-all shrink-0"
          >
            <Edit2 size={16} />
          </button>
        </div>
      </header>

      <div className="px-5 py-5 space-y-6">
        {/* Current stock */}
        <section className="glass-card rounded-[1.75rem] p-5 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t('app.currentStock')}
          </p>

          <div data-testid="stock-qty" className="flex items-end gap-2">
            <span className="text-5xl font-black text-foreground leading-none">{item.currentStock}</span>
            <span className="text-xl text-muted-foreground font-medium mb-1">{item.unit}</span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setLogEntrySheetOpen(true, item.id, ENTRY_TYPE.PURCHASE)}
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm hover:bg-emerald-500/20 transition-all active:scale-95"
            >
              <ShoppingBag size={16} />
              {t('app.purchase')}
            </button>
            <button
              type="button"
              onClick={() => setLogEntrySheetOpen(true, item.id, ENTRY_TYPE.CONSUME)}
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-sm hover:bg-orange-500/20 transition-all active:scale-95"
            >
              <ArrowDownRight size={16} />
              {t('app.consume')}
            </button>
          </div>
        </section>

        {/* Price Intelligence */}
        <section data-testid="price-intelligence-section" className="glass-card rounded-[1.75rem] p-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t('app.priceIntelligence')}
          </p>
          <PriceIntelligencePanel purchases={purchaseHistory} />
        </section>

        {/* History */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('app.history')}
            </p>
            <div className="flex gap-1">
              {FILTERS.map(({ key, label, testId }) => (
                <button
                  key={key}
                  data-testid={testId}
                  type="button"
                  onClick={() => setHistoryFilter(key)}
                  className={`h-7 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    historyFilter === key
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] px-5 divide-y divide-border/30">
            {filteredEntries.length === 0 ? (
              <p className="py-8 text-sm text-muted-foreground text-center">{t('app.noResults')}</p>
            ) : (
              filteredEntries.map((entry) => (
                <ItemHistoryRow
                  key={entry.id}
                  entry={entry}
                  itemAvgPrice={avgPrice}
                  onEdit={(e) => setEditEntry(e)}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Edit entry sheet */}
      {editEntry && (
        <EditEntrySheet
          entry={editEntry}
          isOpen={!!editEntry}
          onClose={() => setEditEntry(null)}
          onDelete={(e) => { setEditEntry(null); setDeleteEntry(e); }}
        />
      )}

      {/* Delete entry modal */}
      {deleteEntry && (
        <DeleteEntryModal
          entry={deleteEntry}
          itemName={item.name}
          isOpen={!!deleteEntry}
          onClose={() => setDeleteEntry(null)}
          onConfirm={() => { deleteEntryOffline(deleteEntry.id); setDeleteEntry(null); }}
        />
      )}
    </div>
  );
}
