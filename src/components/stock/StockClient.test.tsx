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
  useUI: () => ({ setLogEntrySheetOpen: vi.fn() }),
}));

vi.mock('@/components/providers/HouseholdContext', () => ({
  useHousehold: () => ({
    householdId: 'hh1',
    currentUserId: 'u1',
    members: [
      { userId: 'u1', username: 'Alex' },
      { userId: 'u2', username: 'Sam' },
    ],
  }),
}));

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const cat: Category = {
  id: 1, householdId: 'hh1', name: 'Fabric Softener',
  defaultUnit: 'bottle', createdAt: new Date(),
};

const makeItem = (overrides: Partial<Item> = {}): Item => ({
  id: 1, householdId: 'hh1', categoryId: 1, name: 'Downy 1L', unit: 'bottle',
  currentStock: 2, lowStockThreshold: null, alertEnabled: 1,
  lastEntryAt: null, createdAt: new Date(), updatedAt: new Date(),
  ...overrides,
});

const makeEntry = (): Entry => ({
  id: 10, householdId: 'hh1', itemId: 1, type: 'purchase',
  price: 89, quantity: 2, unit: 'bottle', store: 'Big C',
  date: '2026-06-10', note: null, userId: 'u1', createdAt: new Date(),
});

describe('StockClient', () => {
  it('shows empty state when no items', () => {
    wrap(<StockClient itemsByCategory={[]} />);
    expect(screen.getByTestId('stock-empty')).toBeDefined();
  });

  it('renders a category group per category', () => {
    const data = [{
      category: cat,
      items: [{ item: makeItem(), lastEntry: makeEntry() }],
    }];
    wrap(<StockClient itemsByCategory={data} />);
    expect(screen.getByText('Fabric Softener')).toBeDefined();
    expect(screen.getByTestId('stock-item-card')).toBeDefined();
  });

  it('shows LowStockRail for out/low items', () => {
    const outItem = makeItem({ id: 2, name: 'Empty Item', currentStock: 0 });
    const data = [{
      category: cat,
      items: [
        { item: makeItem(), lastEntry: null },
        { item: outItem, lastEntry: null },
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
    act(() => {
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'downy' } });
    });
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
});

describe('StockClient — group filter', () => {
  const data = [{
    category: cat,
    items: [
      { item: makeItem({ id: 1, name: 'Downy 1L' }),     lastEntry: null },
      { item: makeItem({ id: 2, name: 'Comfort 750ml' }), lastEntry: null },
      { item: makeItem({ id: 3, name: 'Snuggle 1.5L' }), lastEntry: null },
    ],
  }];

  const groups = [
    { id: 10, name: 'Fridge', itemIds: [1, 3] },
    { id: 11, name: 'Pantry', itemIds: [2] },
  ];

  it('does not render group strip when no groups are provided', () => {
    wrap(<StockClient itemsByCategory={data} />);
    expect(screen.queryByTestId('group-filter-strip')).toBeNull();
  });

  it('renders a group chip for each group', () => {
    wrap(<StockClient itemsByCategory={data} groups={groups} />);
    expect(screen.getByTestId('group-filter-strip')).toBeDefined();
    expect(screen.getByText('Fridge')).toBeDefined();
    expect(screen.getByText('Pantry')).toBeDefined();
  });

  it('shows all items when no group is selected', () => {
    wrap(<StockClient itemsByCategory={data} groups={groups} />);
    expect(screen.getByText('Downy 1L')).toBeDefined();
    expect(screen.getByText('Comfort 750ml')).toBeDefined();
    expect(screen.getByText('Snuggle 1.5L')).toBeDefined();
  });

  it('narrows items to the selected group on chip tap', () => {
    wrap(<StockClient itemsByCategory={data} groups={groups} />);
    act(() => fireEvent.click(screen.getByText('Fridge')));
    expect(screen.getByText('Downy 1L')).toBeDefined();
    expect(screen.getByText('Snuggle 1.5L')).toBeDefined();
    expect(screen.queryByText('Comfort 750ml')).toBeNull();
  });

  it('deselects group (shows all) when the same chip is tapped again', () => {
    wrap(<StockClient itemsByCategory={data} groups={groups} />);
    act(() => fireEvent.click(screen.getByText('Pantry')));
    act(() => fireEvent.click(screen.getByText('Pantry')));
    expect(screen.getByText('Downy 1L')).toBeDefined();
    expect(screen.getByText('Comfort 750ml')).toBeDefined();
    expect(screen.getByText('Snuggle 1.5L')).toBeDefined();
  });

  it('switches group filter when a different chip is tapped', () => {
    wrap(<StockClient itemsByCategory={data} groups={groups} />);
    act(() => fireEvent.click(screen.getByText('Fridge')));
    act(() => fireEvent.click(screen.getByText('Pantry')));
    expect(screen.getByText('Comfort 750ml')).toBeDefined();
    expect(screen.queryByText('Downy 1L')).toBeNull();
    expect(screen.queryByText('Snuggle 1.5L')).toBeNull();
  });
});
