import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import ItemDetailClient from './ItemDetailClient';
import type { Item, Category, Entry } from '@/lib/db/schema';

afterEach(cleanup);

const mockDeleteEntryOffline = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock('@/components/providers/UIContext', () => ({
  useLogSheet: () => ({ open: vi.fn(), close: vi.fn(), isOpen: false, prefillItemId: undefined, prefillType: undefined }),
  useItemSheet: () => ({ openEdit: vi.fn(), openDelete: vi.fn(), close: vi.fn(), isEditOpen: false, editTarget: null, editEntryCount: 0, isDeleteOpen: false, deleteTarget: null }),
}));

vi.mock('@/components/providers/OfflineContext', () => ({
  useOffline: () => ({ deleteEntryOffline: mockDeleteEntryOffline }),
}));

vi.mock('@/app/app/actions', () => ({
  updateEntry: vi.fn().mockResolvedValue({}),
}));

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const item: Item = {
  id: 1, householdId: 'hh1', categoryId: 1,
  name: 'Downy 1L Lavender', unit: 'bottle', currentStock: 2,
  lowStockThreshold: null, alertEnabled: 1,
  lastEntryAt: null, createdAt: new Date(), updatedAt: new Date(),
};

const category: Category = {
  id: 1, householdId: 'hh1', name: 'Fabric Softener',
  defaultUnit: 'bottle', createdAt: new Date(),
};

const makePurchase = (id: number, price: number, store: string, date: string): Entry => ({
  id, householdId: 'hh1', itemId: 1, type: 'purchase',
  price, quantity: 2, unit: 'bottle', store,
  date, note: null, userId: 'u1', createdAt: new Date(),
});

const makeConsume = (id: number, date: string): Entry => ({
  id, householdId: 'hh1', itemId: 1, type: 'consume',
  price: null, quantity: 1, unit: 'bottle', store: null,
  date, note: null, userId: 'u1', createdAt: new Date(),
});

const allEntries = [
  makePurchase(10, 89, 'Big C', '2026-06-10'),
  makeConsume(11, '2026-06-12'),
  makePurchase(12, 99, 'CJ', '2026-05-01'),
];

const purchaseHistory = allEntries.filter(e => e.type === 'purchase');

describe('ItemDetailClient', () => {
  beforeEach(() => { mockDeleteEntryOffline.mockReset(); });

  it('shows item name in header', () => {
    wrap(<ItemDetailClient item={item} category={category} allEntries={allEntries} purchaseHistory={purchaseHistory} />);
    expect(screen.getByTestId('item-name').textContent).toBe('Downy 1L Lavender');
  });

  it('shows category label', () => {
    wrap(<ItemDetailClient item={item} category={category} allEntries={allEntries} purchaseHistory={purchaseHistory} />);
    expect(screen.getByTestId('category-label').textContent).toBe('Fabric Softener');
  });

  it('shows current stock quantity and unit', () => {
    wrap(<ItemDetailClient item={item} category={category} allEntries={allEntries} purchaseHistory={purchaseHistory} />);
    expect(screen.getByTestId('stock-qty').textContent).toContain('2');
    expect(screen.getByTestId('stock-qty').textContent).toContain('bottle');
  });

  it('renders history rows for all entries', () => {
    wrap(<ItemDetailClient item={item} category={category} allEntries={allEntries} purchaseHistory={purchaseHistory} />);
    expect(screen.getAllByTestId('history-row')).toHaveLength(3);
  });

  it('filters to only purchase entries when Purchase tab selected', () => {
    wrap(<ItemDetailClient item={item} category={category} allEntries={allEntries} purchaseHistory={purchaseHistory} />);
    act(() => fireEvent.click(screen.getByTestId('filter-purchase')));
    expect(screen.getAllByTestId('history-row')).toHaveLength(2);
  });

  it('filters to only consume entries when Consume tab selected', () => {
    wrap(<ItemDetailClient item={item} category={category} allEntries={allEntries} purchaseHistory={purchaseHistory} />);
    act(() => fireEvent.click(screen.getByTestId('filter-consume')));
    expect(screen.getAllByTestId('history-row')).toHaveLength(1);
  });

  it('shows PriceIntelligencePanel section', () => {
    wrap(<ItemDetailClient item={item} category={category} allEntries={allEntries} purchaseHistory={purchaseHistory} />);
    expect(screen.getByTestId('price-intelligence-section')).toBeDefined();
  });

  it('calls deleteEntryOffline with the entry id when delete is confirmed', async () => {
    wrap(<ItemDetailClient item={item} category={category} allEntries={allEntries} purchaseHistory={purchaseHistory} />);

    // Step 1: open EditEntrySheet for the first entry
    await act(async () => {
      fireEvent.click(screen.getAllByTestId('edit-entry-btn')[0]);
    });

    // Step 2: click the delete button inside EditEntrySheet
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-entry-btn'));
    });

    // Step 3: confirm deletion in DeleteEntryModal
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-delete-btn'));
    });

    expect(mockDeleteEntryOffline).toHaveBeenCalledOnce();
    expect(mockDeleteEntryOffline).toHaveBeenCalledWith(allEntries[0].id);
  });
});
