import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import CategoryGroup from './CategoryGroup';
import type { Item, Category } from '@/lib/db/schema';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const cat: Category = {
  id: 1, householdId: 'hh1', name: 'Fabric Softener',
  defaultUnit: 'bottle', createdAt: new Date(),
};

const items: Array<{ item: Item; lastEntry: null }> = [
  {
    item: { id: 1, householdId: 'hh1', categoryId: 1, name: 'Downy 1L', unit: 'bottle',
      currentStock: 2, lowStockThreshold: null, alertEnabled: 1,
      lastEntryAt: null, createdAt: new Date(), updatedAt: new Date() },
    lastEntry: null,
  },
  {
    item: { id: 2, householdId: 'hh1', categoryId: 1, name: 'Comfort 750ml', unit: 'bottle',
      currentStock: 0, lowStockThreshold: null, alertEnabled: 1,
      lastEntryAt: null, createdAt: new Date(), updatedAt: new Date() },
    lastEntry: null,
  },
];

describe('CategoryGroup', () => {
  it('shows the category name as a header', () => {
    wrap(<CategoryGroup category={cat} items={items} onItemTap={vi.fn()} />);
    expect(screen.getByText('Fabric Softener')).toBeDefined();
  });

  it('renders one card per item', () => {
    wrap(<CategoryGroup category={cat} items={items} onItemTap={vi.fn()} />);
    expect(screen.getAllByTestId('stock-item-card')).toHaveLength(2);
  });

  it('shows "Uncategorized" for null category', () => {
    wrap(<CategoryGroup category={null} items={items} onItemTap={vi.fn()} />);
    expect(screen.getByText('Uncategorized')).toBeDefined();
  });
});
