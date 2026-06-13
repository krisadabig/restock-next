'use client';

import { useTranslation } from '@/lib/i18n';
import StockItemCard from './StockItemCard';
import type { Item, Category, Entry } from '@/lib/db/schema';

interface StockEntry {
  item: Item;
  lastEntry: Entry | null;
}

interface Props {
  category: Category | null;
  items: StockEntry[];
  onItemTap: (item: Item) => void;
}

export default function CategoryGroup({ category, items, onItemTap }: Props) {
  const { t } = useTranslation();

  if (items.length === 0) return null;

  const label = category?.name ?? t('app.uncategorized');

  return (
    <section className="space-y-3">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">
        {label}
      </h2>
      <div className="space-y-3">
        {items.map(({ item, lastEntry }) => (
          <StockItemCard
            key={item.id}
            item={item}
            lastEntry={lastEntry}
            onTap={() => onItemTap(item)}
          />
        ))}
      </div>
    </section>
  );
}
