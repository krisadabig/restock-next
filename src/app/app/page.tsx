import { Suspense } from 'react';
import { getHouseholdItems } from '@/app/app/actions';
import StockClient from '@/components/stock/StockClient';
import { SkeletonList } from '@/components/SkeletonList';
import type { Item, Category, Entry } from '@/lib/db/schema';

interface StockEntry { item: Item; lastEntry: Entry | null }
interface CategoryData { category: Category | null; items: StockEntry[] }

async function StockContent() {
  const raw = await getHouseholdItems();

  // Group by category server-side
  const grouped = new Map<string, CategoryData>();

  for (const { item, category, lastEntry } of raw) {
    const key = category?.id != null ? String(category.id) : 'null';
    if (!grouped.has(key)) {
      grouped.set(key, { category: category ?? null, items: [] });
    }
    grouped.get(key)!.items.push({ item, lastEntry });
  }

  const itemsByCategory = Array.from(grouped.values());

  return <StockClient itemsByCategory={itemsByCategory} />;
}

export default function StockPage() {
  return (
    <Suspense fallback={<SkeletonList />}>
      <StockContent />
    </Suspense>
  );
}
