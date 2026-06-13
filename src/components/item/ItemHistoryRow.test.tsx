import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import ItemHistoryRow from './ItemHistoryRow';
import type { Entry } from '@/lib/db/schema';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const purchase: Entry = {
  id: 1, householdId: 'hh1', itemId: 1, type: 'purchase',
  price: 89, quantity: 2, unit: 'bottle', store: 'Big C',
  date: '2026-06-10', note: null, userId: 'u1', createdAt: new Date(),
};

const consume: Entry = {
  id: 2, householdId: 'hh1', itemId: 1, type: 'consume',
  price: null, quantity: 1, unit: 'bottle', store: null,
  date: '2026-06-15', note: null, userId: 'u1', createdAt: new Date(),
};

describe('ItemHistoryRow', () => {
  it('shows purchase icon for purchase entry', () => {
    wrap(<ItemHistoryRow entry={purchase} itemAvgPrice={100} onEdit={vi.fn()} />);
    expect(screen.getByTestId('entry-type-icon').getAttribute('data-type')).toBe('purchase');
  });

  it('shows consume icon for consume entry', () => {
    wrap(<ItemHistoryRow entry={consume} itemAvgPrice={100} onEdit={vi.fn()} />);
    expect(screen.getByTestId('entry-type-icon').getAttribute('data-type')).toBe('consume');
  });

  it('shows quantity and unit', () => {
    wrap(<ItemHistoryRow entry={purchase} itemAvgPrice={100} onEdit={vi.fn()} />);
    const row = screen.getByTestId('history-row');
    expect(row.textContent).toContain('2');
    expect(row.textContent).toContain('bottle');
  });

  it('shows price and store for purchase', () => {
    wrap(<ItemHistoryRow entry={purchase} itemAvgPrice={100} onEdit={vi.fn()} />);
    const row = screen.getByTestId('history-row');
    expect(row.textContent).toContain('89');
    expect(row.textContent).toContain('Big C');
  });

  it('does not show price or store for consume', () => {
    wrap(<ItemHistoryRow entry={consume} itemAvgPrice={100} onEdit={vi.fn()} />);
    const row = screen.getByTestId('history-row');
    expect(row.textContent).not.toContain('Big C');
  });

  it('shows note when present', () => {
    const withNote = { ...purchase, note: 'On sale!' };
    wrap(<ItemHistoryRow entry={withNote} itemAvgPrice={100} onEdit={vi.fn()} />);
    expect(screen.getByTestId('entry-note').textContent).toBe('On sale!');
  });

  it('shows SaleFlagBadge when price >15% below avg', () => {
    const saleEntry = { ...purchase, price: 79 }; // 79 vs avg 100 = 21% below
    wrap(<ItemHistoryRow entry={saleEntry} itemAvgPrice={100} onEdit={vi.fn()} />);
    expect(screen.getByTestId('sale-flag')).toBeDefined();
  });

  it('does not show SaleFlagBadge when price within 15% of avg', () => {
    const normalEntry = { ...purchase, price: 90 }; // 90 vs avg 100 = 10% below
    wrap(<ItemHistoryRow entry={normalEntry} itemAvgPrice={100} onEdit={vi.fn()} />);
    expect(screen.queryByTestId('sale-flag')).toBeNull();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    wrap(<ItemHistoryRow entry={purchase} itemAvgPrice={100} onEdit={onEdit} />);
    fireEvent.click(screen.getByTestId('edit-entry-btn'));
    expect(onEdit).toHaveBeenCalledWith(purchase);
  });
});
