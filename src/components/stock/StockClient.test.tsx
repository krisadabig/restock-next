import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import StockClient from './StockClient';
import type { Item, Category, Entry } from '@/lib/db/schema';

afterEach(cleanup);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/providers/UIContext', () => ({
  useQuickLog: () => ({ open: vi.fn(), close: vi.fn(), isOpen: false, itemId: null, prefill: null }),
}));

vi.mock('@/components/providers/SpaceContext', () => ({
  useSpace: () => ({
    spaceId: 'sp1',
    memberId: 1,
    displayName: 'Alex',
    avatar: null,
    members: [
      { memberId: 1, displayName: 'Alex', avatar: null },
      { memberId: 2, displayName: 'Sam', avatar: null },
    ],
    mySpaces: [{ id: 'sp1', name: 'My Home' }],
  }),
}));

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const cat: Category = {
  id: 1, spaceId: 'sp1', name: 'Fabric Softener',
  defaultUnit: 'bottle', createdAt: new Date(),
};

const makeItem = (overrides: Partial<Item> = {}): Item => ({
  id: 1, spaceId: 'sp1', categoryId: 1, name: 'Downy 1L', unit: 'bottle',
  currentStock: 2, lowStockThreshold: null, alertEnabled: true,
  lastEntryAt: null, createdAt: new Date(), updatedAt: new Date(),
  ...overrides,
});

const makeEntry = (overrides: Partial<Entry> = {}): Entry => ({
  id: 10, spaceId: 'sp1', itemId: 1, memberId: 1, type: 'purchase',
  price: 89, quantity: 2, unit: 'bottle', store: 'Big C',
  date: '2026-06-10', note: null, createdAt: new Date(),
  ...overrides,
});

describe('StockClient', () => {
  it('shows empty state when no items', () => {
    wrap(<StockClient itemsByCategory={[]} />);
    expect(screen.getByTestId('stock-empty')).toBeDefined();
  });

  it('renders a category group per category', () => {
    const data = [{ category: cat, items: [{ item: makeItem(), lastEntry: makeEntry() }] }];
    wrap(<StockClient itemsByCategory={data} />);
    expect(screen.getByText('Fabric Softener')).toBeDefined();
    expect(screen.getByTestId('stock-item-card')).toBeDefined();
  });

  it('shows LowStockRail for out/low items', () => {
    const data = [{
      category: cat,
      items: [
        { item: makeItem(), lastEntry: null },
        { item: makeItem({ id: 2, name: 'Empty Item', currentStock: 0 }), lastEntry: null },
      ],
    }];
    wrap(<StockClient itemsByCategory={data} />);
    expect(screen.getByTestId('low-stock-rail')).toBeDefined();
  });

  it('filters items by search query', () => {
    const data = [{
      category: cat,
      items: [
        { item: makeItem({ id: 1, name: 'Downy 1L' }), lastEntry: null },
        { item: makeItem({ id: 2, name: 'Comfort 750ml' }), lastEntry: null },
      ],
    }];
    wrap(<StockClient itemsByCategory={data} />);
    act(() => { fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'downy' } }); });
    expect(screen.getByText('Downy 1L')).toBeDefined();
    expect(screen.queryByText('Comfort 750ml')).toBeNull();
  });

  it('filter chip "Out of Stock" shows only out items', () => {
    const data = [{
      category: cat,
      items: [
        { item: makeItem({ id: 1, name: 'Downy 1L', currentStock: 2 }), lastEntry: null },
        { item: makeItem({ id: 2, name: 'Comfort 750ml', currentStock: 0 }), lastEntry: null },
      ],
    }];
    wrap(<StockClient itemsByCategory={data} />);
    act(() => fireEvent.click(screen.getByText('Out of Stock')));
    expect(screen.getByText('Comfort 750ml')).toBeDefined();
    expect(screen.queryByText('Downy 1L')).toBeNull();
  });

  it('partner tag shows display_name when last entry is from other member', () => {
    // memberId: 2 = Sam (partner), current user is memberId: 1
    const partnerEntry = makeEntry({ memberId: 2, createdAt: new Date() });
    const data = [{ category: cat, items: [{ item: makeItem(), lastEntry: partnerEntry }] }];
    wrap(<StockClient itemsByCategory={data} />);
    expect(screen.getByTestId('partner-tag').textContent).toContain('Sam');
  });

  it('never renders group filter strip', () => {
    wrap(<StockClient itemsByCategory={[]} />);
    expect(screen.queryByTestId('group-filter-strip')).toBeNull();
  });
});
