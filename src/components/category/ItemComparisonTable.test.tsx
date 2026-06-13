import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import ItemComparisonTable from './ItemComparisonTable';
import type { Item } from '@/lib/db/schema';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const makeItem = (id: number, name: string, unit: string): Item => ({
  id, householdId: 'hh1', categoryId: 1, name, unit,
  currentStock: 2, lowStockThreshold: null, alertEnabled: 1,
  lastEntryAt: null, createdAt: new Date(), updatedAt: new Date(),
});

const rows = [
  { item: makeItem(1, 'Downy 1L Lavender', 'bottle'), avgPrice: 105, bestPrice: 79 },
  { item: makeItem(2, 'Comfort 750ml Fresh', 'bottle'), avgPrice: 68, bestPrice: 55 },
  { item: makeItem(3, 'Snuggle 1.5L', 'bottle'), avgPrice: 145, bestPrice: 120 },
];

describe('ItemComparisonTable', () => {
  it('renders all item rows', () => {
    wrap(<ItemComparisonTable rows={rows} onItemTap={vi.fn()} />);
    expect(screen.getByText('Downy 1L Lavender')).toBeDefined();
    expect(screen.getByText('Comfort 750ml Fresh')).toBeDefined();
    expect(screen.getByText('Snuggle 1.5L')).toBeDefined();
  });

  it('shows avg and best prices for each item', () => {
    wrap(<ItemComparisonTable rows={rows} onItemTap={vi.fn()} />);
    expect(screen.getByTestId('avg-1').textContent).toContain('105');
    expect(screen.getByTestId('best-1').textContent).toContain('79');
    expect(screen.getByTestId('avg-2').textContent).toContain('68');
    expect(screen.getByTestId('best-2').textContent).toContain('55');
  });

  it('marks the item with lowest avg price as cheapest', () => {
    wrap(<ItemComparisonTable rows={rows} onItemTap={vi.fn()} />);
    // Comfort 750ml has lowest avg (68)
    expect(screen.getByTestId('cheapest-badge-2')).toBeDefined();
    expect(screen.queryByTestId('cheapest-badge-1')).toBeNull();
    expect(screen.queryByTestId('cheapest-badge-3')).toBeNull();
  });

  it('shows dash when item has no purchase history', () => {
    const noHistory = [
      { item: makeItem(1, 'New Item', 'bottle'), avgPrice: null, bestPrice: null },
    ];
    wrap(<ItemComparisonTable rows={noHistory} onItemTap={vi.fn()} />);
    expect(screen.getByTestId('avg-1').textContent).toBe('—');
  });

  it('calls onItemTap with item id when row is tapped', () => {
    const onTap = vi.fn();
    wrap(<ItemComparisonTable rows={rows} onItemTap={onTap} />);
    fireEvent.click(screen.getByTestId('item-row-1'));
    expect(onTap).toHaveBeenCalledWith(1);
  });
});
