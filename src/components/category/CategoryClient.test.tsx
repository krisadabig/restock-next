import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import CategoryClient from './CategoryClient';
import type { Category, Item, Entry } from '@/lib/db/schema';

afterEach(cleanup);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const category: Category = {
  id: 1, householdId: 'hh1', name: 'Fabric Softener',
  defaultUnit: 'bottle', createdAt: new Date(),
};

const makeItem = (id: number, name: string): Item => ({
  id, householdId: 'hh1', categoryId: 1, name, unit: 'bottle',
  currentStock: 2, lowStockThreshold: null, alertEnabled: 1,
  lastEntryAt: null, createdAt: new Date(), updatedAt: new Date(),
});

const makePurchase = (id: number, itemId: number, price: number, date: string): Entry => ({
  id, householdId: 'hh1', itemId, type: 'purchase',
  price, quantity: 2, unit: 'bottle', store: 'Big C',
  date, note: null, userId: 'u1', createdAt: new Date(),
});

const items = [makeItem(1, 'Downy 1L Lavender'), makeItem(2, 'Comfort 750ml Fresh')];

const purchaseEntries = [
  makePurchase(10, 1, 89, '2026-06-10'),
  makePurchase(11, 1, 99, '2026-05-01'),
  makePurchase(12, 2, 65, '2026-06-05'),
];

const monthlySpend = [
  { month: '2026-04', total: 99 },
  { month: '2026-05', total: 99 },
  { month: '2026-06', total: 243 },
];

describe('CategoryClient', () => {
  it('shows category name in header', () => {
    wrap(<CategoryClient category={category} items={items} purchaseEntries={purchaseEntries} monthlySpend={monthlySpend} />);
    expect(screen.getByTestId('category-name').textContent).toBe('Fabric Softener');
  });

  it('renders the items comparison section', () => {
    wrap(<CategoryClient category={category} items={items} purchaseEntries={purchaseEntries} monthlySpend={monthlySpend} />);
    expect(screen.getByTestId('comparison-section')).toBeDefined();
    expect(screen.getByText('Downy 1L Lavender')).toBeDefined();
    expect(screen.getByText('Comfort 750ml Fresh')).toBeDefined();
  });

  it('shows total spend section with this month spend', () => {
    wrap(<CategoryClient category={category} items={items} purchaseEntries={purchaseEntries} monthlySpend={monthlySpend} />);
    expect(screen.getByTestId('spend-section')).toBeDefined();
    // June 2026 total = 243
    expect(screen.getByTestId('spend-this-month').textContent).toContain('243');
  });

  it('renders the bar chart section when monthly data exists', () => {
    wrap(<CategoryClient category={category} items={items} purchaseEntries={purchaseEntries} monthlySpend={monthlySpend} />);
    expect(screen.getByTestId('chart-section')).toBeDefined();
  });

  it('shows empty state when no items in category', () => {
    wrap(<CategoryClient category={category} items={[]} purchaseEntries={[]} monthlySpend={[]} />);
    expect(screen.getByTestId('no-items-state')).toBeDefined();
  });
});
