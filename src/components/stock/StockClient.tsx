'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { stockStatus } from '@/lib/stock';
import { useHousehold } from '@/components/providers/HouseholdContext';
import { useUI } from '@/components/providers/UIContext';
import { THRESHOLDS, DEFAULTS } from '@/lib/constants';
import LowStockRail from './LowStockRail';
import CategoryGroup from './CategoryGroup';
import ActivityStrip from './ActivityStrip';
import QuickLogStrip from './QuickLogStrip';
import type { Item, Category, Entry } from '@/lib/db/schema';

interface StockEntry {
  item: Item;
  lastEntry: Entry | null;
}

interface CategoryData {
  category: Category | null;
  items: StockEntry[];
}

interface Props {
  itemsByCategory: CategoryData[];
}

type Filter = 'all' | 'out' | 'low' | 'az' | 'recent';

function relativeHours(now: number, date: Date): number {
  return (now - date.getTime()) / (1000 * 60 * 60);
}

function formatPartnerTag(now: number, username: string, lastEntryAt: Date): string {
  const hours = Math.floor(relativeHours(now, lastEntryAt));
  if (hours < 1) return `${username}·now`;
  if (hours < 24) return `${username}·${hours}h`;
  return `${username}·yesterday`;
}

export default function StockClient({ itemsByCategory }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { currentUserId, members } = useHousehold();
  const { setLogEntrySheetOpen } = useUI();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [now] = useState(() => Date.now());

  const allItems: StockEntry[] = useMemo(
    () => itemsByCategory.flatMap((g) => g.items),
    [itemsByCategory],
  );

  // Derive partner member (the other household member)
  const partner = useMemo(
    () => members.find((m) => m.userId !== currentUserId) ?? null,
    [members, currentUserId],
  );

  // Items the partner logged as their most recent entry within 24h → ActivityStrip data
  const partnerActivityItems = useMemo(() => {
    if (!partner) return [];
    const cutoff = THRESHOLDS.ACTIVITY_STRIP_HOURS * 60 * 60 * 1000;
    return allItems
      .filter(({ lastEntry }) => {
        if (!lastEntry || lastEntry.userId !== partner.userId) return false;
        const age = now - new Date(lastEntry.createdAt!).getTime();
        return age <= cutoff;
      })
      .map(({ item, lastEntry }) => ({ id: item.id, name: item.name, entryAt: new Date(lastEntry!.createdAt!) }));
  }, [allItems, partner, now]);

  const partnerLastActivityAt = useMemo(() => {
    if (partnerActivityItems.length === 0) return null;
    return partnerActivityItems.reduce<Date>((latest, { entryAt }) =>
      entryAt > latest ? entryAt : latest,
      partnerActivityItems[0].entryAt,
    );
  }, [partnerActivityItems]);

  // Partner tags per item (shown on card when partner was last to log this item within 48h)
  const partnerTags = useMemo<Record<number, string>>(() => {
    if (!partner) return {};
    const cutoff = THRESHOLDS.PARTNER_TAG_HOURS * 60 * 60 * 1000;
    const tags: Record<number, string> = {};
    for (const { item, lastEntry } of allItems) {
      if (!lastEntry || lastEntry.userId !== partner.userId) continue;
      const age = now - new Date(lastEntry.createdAt!).getTime();
      if (age <= cutoff) {
        tags[item.id] = formatPartnerTag(now, partner.username, new Date(lastEntry.createdAt!));
      }
    }
    return tags;
  }, [allItems, partner, now]);

  // Recent items for QuickLogStrip — sorted by lastEntryAt descending, top RECENT_CHIPS_STRIP
  const recentItems = useMemo(() => {
    return [...allItems]
      .filter(({ item }) => item.lastEntryAt != null)
      .sort((a, b) =>
        new Date(b.item.lastEntryAt!).getTime() - new Date(a.item.lastEntryAt!).getTime(),
      )
      .slice(0, DEFAULTS.RECENT_CHIPS_STRIP)
      .map(({ item }) => ({ id: item.id, name: item.name }));
  }, [allItems]);

  // Apply search + filter
  const filtered: CategoryData[] = useMemo(() => {
    const query = search.toLowerCase();

    let items = allItems.filter((e) =>
      query ? e.item.name.toLowerCase().includes(query) : true,
    );

    if (filter === 'out') items = items.filter(({ item }) => stockStatus(item) === 'out');
    if (filter === 'low') items = items.filter(({ item }) => stockStatus(item) === 'low');
    if (filter === 'az') items = [...items].sort((a, b) => a.item.name.localeCompare(b.item.name));

    // Re-group filtered items by category
    const grouped = new Map<string, CategoryData>();
    for (const e of items) {
      const key = e.item.categoryId != null ? String(e.item.categoryId) : 'null';
      if (!grouped.has(key)) {
        const cat = itemsByCategory.find((g) =>
          g.category?.id === e.item.categoryId || (g.category == null && e.item.categoryId == null),
        );
        grouped.set(key, { category: cat?.category ?? null, items: [] });
      }
      grouped.get(key)!.items.push(e);
    }
    return Array.from(grouped.values());
  }, [allItems, itemsByCategory, search, filter]);

  const urgentItems = useMemo(
    () => allItems.filter(({ item }) => {
      const s = stockStatus(item);
      return s === 'out' || s === 'low';
    }),
    [allItems],
  );

  const handleItemTap = (item: Item) => router.push(`/app/item/${item.id}`);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all',    label: t('app.filterAll') },
    { key: 'out',    label: t('app.filterOutOfStock') },
    { key: 'low',    label: t('app.filterLow') },
    { key: 'az',     label: t('app.filterAlphabetical') },
    { key: 'recent', label: t('app.filterRecent') },
  ];

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 px-8 text-center">
        <Package size={48} className="text-muted-foreground/40" />
        <p data-testid="stock-empty" className="text-sm text-muted-foreground font-medium">
          {t('app.stockEmpty')}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-32 space-y-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-5 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              data-testid="search-input"
              type="search"
              placeholder={t('app.searchStock')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-premium pl-9 h-11 text-sm"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`shrink-0 h-8 px-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                filter === key
                  ? 'bg-primary text-white border-primary'
                  : 'bg-secondary/50 border-primary/10 text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Activity strip — partner's recent logged items */}
      {partner && partnerActivityItems.length > 0 && partnerLastActivityAt && (
        <ActivityStrip
          partnerName={partner.username}
          items={partnerActivityItems}
          lastActivityAt={partnerLastActivityAt}
          onChipTap={(id) => router.push(`/app/item/${id}`)}
        />
      )}

      {/* Quick log strip */}
      <QuickLogStrip
        items={recentItems}
        onSelect={(id) => setLogEntrySheetOpen(true, id, 'purchase')}
      />

      <div className="px-5 space-y-6">
        {/* Low stock rail (pinned, always shows if items qualify, regardless of filter) */}
        {filter === 'all' && urgentItems.length > 0 && (
          <LowStockRail items={urgentItems} onItemTap={handleItemTap} />
        )}

        {/* Category groups */}
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('app.noResults')}</p>
        ) : (
          filtered.map((group, i) => (
            <CategoryGroup
              key={group.category?.id ?? `null-${i}`}
              category={group.category}
              items={group.items}
              onItemTap={handleItemTap}
              partnerTags={partnerTags}
            />
          ))
        )}
      </div>
    </div>
  );
}
