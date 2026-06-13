import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import PriceIntelligencePanel from './PriceIntelligencePanel';
import type { Entry } from '@/lib/db/schema';

afterEach(cleanup);

const wrap = (ui: React.ReactNode) =>
  render(<I18nProvider initialLocale="en">{ui}</I18nProvider>);

const makePurchase = (price: number, store: string, date: string): Entry => ({
  id: Math.random(), householdId: 'hh1', itemId: 1, type: 'purchase',
  price, quantity: 1, unit: 'bottle', store,
  date, note: null, userId: 'u1', createdAt: new Date(),
});

describe('PriceIntelligencePanel', () => {
  it('shows empty state when fewer than 2 purchases', () => {
    wrap(<PriceIntelligencePanel purchases={[makePurchase(89, 'Big C', '2026-06-01')]} />);
    expect(screen.getByTestId('price-empty')).toBeDefined();
  });

  it('shows avg, best, last prices with 2+ purchases', () => {
    const purchases = [
      makePurchase(89, 'Big C', '2026-06-01'),  // newest = last
      makePurchase(105, 'CJ', '2026-05-01'),
    ];
    wrap(<PriceIntelligencePanel purchases={purchases} />);
    expect(screen.getByTestId('price-avg').textContent).toContain('97');  // (89+105)/2
    expect(screen.getByTestId('price-best').textContent).toContain('89');
    expect(screen.getByTestId('price-last').textContent).toContain('89');
  });

  it('shows DealSignalBadge when last price is below average', () => {
    const purchases = [
      makePurchase(80, 'Big C', '2026-06-01'),  // last=80, avg=90
      makePurchase(100, 'CJ', '2026-05-01'),
    ];
    wrap(<PriceIntelligencePanel purchases={purchases} />);
    expect(screen.getByTestId('deal-signal')).toBeDefined();
  });

  it('does NOT show DealSignalBadge when last price is above average', () => {
    const purchases = [
      makePurchase(110, 'Big C', '2026-06-01'), // last=110, avg=100
      makePurchase(90, 'CJ', '2026-05-01'),
    ];
    wrap(<PriceIntelligencePanel purchases={purchases} />);
    expect(screen.queryByTestId('deal-signal')).toBeNull();
  });

  it('shows store comparison table when 2+ stores', () => {
    const purchases = [
      makePurchase(89, 'Big C', '2026-06-01'),
      makePurchase(112, 'CJ', '2026-05-01'),
    ];
    wrap(<PriceIntelligencePanel purchases={purchases} />);
    expect(screen.getByTestId('store-comparison')).toBeDefined();
    expect(screen.getByTestId('store-comparison').textContent).toContain('Big C');
    expect(screen.getByTestId('store-comparison').textContent).toContain('CJ');
  });

  it('does NOT show store comparison with single store', () => {
    const purchases = [
      makePurchase(89, 'Big C', '2026-06-01'),
      makePurchase(95, 'Big C', '2026-05-01'),
    ];
    wrap(<PriceIntelligencePanel purchases={purchases} />);
    expect(screen.queryByTestId('store-comparison')).toBeNull();
  });
});
