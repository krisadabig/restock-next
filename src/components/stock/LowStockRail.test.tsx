import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import LowStockRail from './LowStockRail';
import type { Item } from '@/lib/db/schema';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const outItem: Item = {
  id: 1, householdId: 'hh1', categoryId: null, name: 'Comfort 750ml', unit: 'bottle',
  currentStock: 0, lowStockThreshold: null, alertEnabled: 1,
  lastEntryAt: null, createdAt: new Date(), updatedAt: new Date(),
};

const lowItem: Item = {
  id: 2, householdId: 'hh1', categoryId: null, name: 'Chicken Breast', unit: 'pack',
  currentStock: 1, lowStockThreshold: 2, alertEnabled: 1,
  lastEntryAt: null, createdAt: new Date(), updatedAt: new Date(),
};

const items = [
  { item: outItem, lastEntry: null },
  { item: lowItem, lastEntry: null },
];

describe('LowStockRail', () => {
  it('renders nothing when items array is empty', () => {
    const { container } = wrap(<LowStockRail items={[]} onItemTap={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows out and low counts in collapsed state', () => {
    wrap(<LowStockRail items={items} onItemTap={vi.fn()} />);
    const text = screen.getByTestId('low-stock-rail').textContent ?? '';
    expect(text).toContain('1'); // outCount shown
    expect(text).toContain('Out of Stock');
  });

  it('expands to show items when header is clicked', () => {
    wrap(<LowStockRail items={items} onItemTap={vi.fn()} />);
    act(() => fireEvent.click(screen.getByTestId('rail-toggle')));
    expect(screen.getAllByTestId('stock-item-card')).toHaveLength(2);
  });
});
