import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import PriceClient from './PriceClient';
import type { Entry } from '@/lib/db/schema';

afterEach(cleanup);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams('range=month'),
}));

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const makeEntry = (id: number, price: number, itemId: number): Entry => ({
  id, householdId: 'hh1', itemId, type: 'purchase',
  price, quantity: 2, unit: 'bottle', store: 'Big C',
  date: '2026-06-10', note: null, userId: 'u1', createdAt: new Date(),
});

const categorySpend = [
  { categoryId: 1, categoryName: 'Fabric Softener', total: 89 },
  { categoryId: 2, categoryName: 'Meat', total: 312 },
];

const recentPurchases = [
  { entry: makeEntry(10, 89, 1), itemId: 1, itemName: 'Downy 1L Lavender', categoryName: 'Fabric Softener' },
  { entry: makeEntry(11, 52, 2), itemId: 2, itemName: 'Chicken Breast 500g', categoryName: 'Meat' },
];

const storeSpend = [
  { store: 'Big C', total: 890, count: 3 },
  { store: 'CJ', total: 350, count: 2 },
];

describe('PriceClient', () => {
  it('renders the total spend amount', () => {
    wrap(
      <PriceClient
        range="month"
        totalSpend={{ current: 1240, previous: 980 }}
        categorySpend={categorySpend}
        recentPurchases={recentPurchases}
        storeSpend={storeSpend}
      />
    );
    expect(screen.getByTestId('total-spend').textContent).toContain('1,240');
  });

  it('renders the TimeRangeSelector', () => {
    wrap(
      <PriceClient
        range="month"
        totalSpend={{ current: 1240, previous: 980 }}
        categorySpend={categorySpend}
        recentPurchases={recentPurchases}
        storeSpend={storeSpend}
      />
    );
    // TimeRangeSelector has This Month button
    expect(screen.getByText('This Month')).toBeDefined();
  });

  it('renders the by-category section', () => {
    wrap(
      <PriceClient
        range="month"
        totalSpend={{ current: 1240, previous: 980 }}
        categorySpend={categorySpend}
        recentPurchases={recentPurchases}
        storeSpend={storeSpend}
      />
    );
    expect(screen.getByTestId('category-section')).toBeDefined();
    expect(screen.getByText('Fabric Softener')).toBeDefined();
    expect(screen.getByText('Meat')).toBeDefined();
  });

  it('renders the recent purchases section', () => {
    wrap(
      <PriceClient
        range="month"
        totalSpend={{ current: 1240, previous: 980 }}
        categorySpend={categorySpend}
        recentPurchases={recentPurchases}
        storeSpend={storeSpend}
      />
    );
    expect(screen.getByTestId('recent-section')).toBeDefined();
    expect(screen.getByText('Downy 1L Lavender')).toBeDefined();
  });

  it('renders the stores section', () => {
    wrap(
      <PriceClient
        range="month"
        totalSpend={{ current: 1240, previous: 980 }}
        categorySpend={categorySpend}
        recentPurchases={recentPurchases}
        storeSpend={storeSpend}
      />
    );
    expect(screen.getByTestId('stores-section')).toBeDefined();
    expect(screen.getByText('Big C')).toBeDefined();
  });

  it('shows empty state when no spend data', () => {
    wrap(
      <PriceClient
        range="month"
        totalSpend={{ current: 0, previous: 0 }}
        categorySpend={[]}
        recentPurchases={[]}
        storeSpend={[]}
      />
    );
    expect(screen.getByTestId('no-spend')).toBeDefined();
  });
});
