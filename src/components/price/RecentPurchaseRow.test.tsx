import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import RecentPurchaseRow from './RecentPurchaseRow';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

describe('RecentPurchaseRow', () => {
  it('renders the item name', () => {
    wrap(
      <RecentPurchaseRow
        itemId={1} itemName="Downy 1L Lavender"
        price={89} store="Big C"
        quantity={2} unit="bottle"
        date="2026-06-10"
        onTap={vi.fn()}
      />
    );
    expect(screen.getByText('Downy 1L Lavender')).toBeDefined();
  });

  it('renders price and store', () => {
    wrap(
      <RecentPurchaseRow
        itemId={1} itemName="Downy 1L Lavender"
        price={89} store="Big C"
        quantity={2} unit="bottle"
        date="2026-06-10"
        onTap={vi.fn()}
      />
    );
    expect(screen.getByTestId('purchase-price').textContent).toContain('89');
    expect(screen.getByTestId('purchase-store').textContent).toContain('Big C');
  });

  it('renders the date', () => {
    wrap(
      <RecentPurchaseRow
        itemId={1} itemName="Downy 1L Lavender"
        price={89} store="Big C"
        quantity={2} unit="bottle"
        date="2026-06-10"
        onTap={vi.fn()}
      />
    );
    expect(screen.getByTestId('purchase-date').textContent).toBeDefined();
  });

  it('calls onTap with itemId when clicked', () => {
    const onTap = vi.fn();
    wrap(
      <RecentPurchaseRow
        itemId={42} itemName="Rice"
        price={189} store="Big C"
        quantity={1} unit="bag"
        date="2026-06-01"
        onTap={onTap}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onTap).toHaveBeenCalledWith(42);
  });
});
