import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import StockItemCard from './StockItemCard';
import type { Item, Entry } from '@/lib/db/schema';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const item: Item = {
  id: 1, householdId: 'hh1', categoryId: 1,
  name: 'Downy 1L Lavender', unit: 'bottle', currentStock: 2,
  lowStockThreshold: null, alertEnabled: 1,
  lastEntryAt: null, createdAt: new Date(), updatedAt: new Date(),
};

const lastEntry: Entry = {
  id: 10, householdId: 'hh1', itemId: 1, type: 'purchase',
  price: 89, quantity: 2, unit: 'bottle', store: 'Big C',
  date: '2026-06-10', note: null, userId: 'u1', createdAt: new Date(),
};

describe('StockItemCard', () => {
  it('shows item name', () => {
    wrap(<StockItemCard item={item} lastEntry={null} onTap={vi.fn()} />);
    expect(screen.getByText('Downy 1L Lavender')).toBeDefined();
  });

  it('shows current stock quantity and unit', () => {
    wrap(<StockItemCard item={item} lastEntry={null} onTap={vi.fn()} />);
    expect(screen.getByTestId('stock-qty').textContent).toContain('2');
    expect(screen.getByTestId('stock-qty').textContent).toContain('bottle');
  });

  it('shows last price and store when lastEntry is provided', () => {
    wrap(<StockItemCard item={item} lastEntry={lastEntry} onTap={vi.fn()} />);
    expect(screen.getByTestId('last-entry').textContent).toContain('89');
    expect(screen.getByTestId('last-entry').textContent).toContain('Big C');
  });

  it('shows "No purchases yet" when no lastEntry', () => {
    wrap(<StockItemCard item={item} lastEntry={null} onTap={vi.fn()} />);
    expect(screen.getByText('No purchases yet')).toBeDefined();
  });

  it('calls onTap when card is clicked', () => {
    const onTap = vi.fn();
    wrap(<StockItemCard item={item} lastEntry={null} onTap={onTap} />);
    fireEvent.click(screen.getByTestId('stock-item-card'));
    expect(onTap).toHaveBeenCalled();
  });

  it('shows partner tag when provided', () => {
    wrap(<StockItemCard item={item} lastEntry={lastEntry} onTap={vi.fn()} partnerTag="Sam·2h" />);
    expect(screen.getByTestId('partner-tag').textContent).toContain('Sam·2h');
  });

  it('does not render partner tag element when not provided', () => {
    wrap(<StockItemCard item={item} lastEntry={lastEntry} onTap={vi.fn()} />);
    expect(screen.queryByTestId('partner-tag')).toBeNull();
  });
});
