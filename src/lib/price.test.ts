import { describe, it, expect } from 'vitest';
import { calculatePriceStats, compareStores } from './price';

const purchase = (price: number, store = 'Big C', date = '2026-01-01') =>
  ({ price, store, date, type: 'purchase' as const });

describe('calculatePriceStats', () => {
  it('returns null for empty history', () => {
    expect(calculatePriceStats([])).toBeNull();
  });

  it('returns correct stats for a single purchase', () => {
    const stats = calculatePriceStats([purchase(100)]);
    expect(stats).toEqual({ avg: 100, best: 100, last: 100, dealSignal: false });
  });

  it('computes avg, best, last correctly across multiple purchases', () => {
    // newest first (as returned from DB)
    const history = [purchase(80, 'Big C', '2026-03-01'), purchase(100, 'CJ', '2026-02-01'), purchase(90, 'Big C', '2026-01-01')];
    const stats = calculatePriceStats(history);
    expect(stats?.avg).toBeCloseTo(90);
    expect(stats?.best).toBe(80);
    expect(stats?.last).toBe(80); // first entry = most recent
  });

  it('sets dealSignal true when last price is below average', () => {
    const history = [purchase(70, 'Big C', '2026-03-01'), purchase(100, 'CJ', '2026-02-01'), purchase(100, 'Big C', '2026-01-01')];
    const stats = calculatePriceStats(history);
    expect(stats?.dealSignal).toBe(true); // 70 < avg(90)
  });

  it('sets dealSignal false when last price equals average', () => {
    const history = [purchase(90), purchase(90)];
    const stats = calculatePriceStats(history);
    expect(stats?.dealSignal).toBe(false);
  });
});

describe('compareStores', () => {
  it('returns empty map for empty history', () => {
    expect(compareStores([])).toEqual({});
  });

  it('returns avg price per store', () => {
    const history = [
      purchase(80, 'Big C'),
      purchase(100, 'Big C'),
      purchase(120, 'CJ'),
    ];
    const result = compareStores(history);
    expect(result['Big C'].avg).toBeCloseTo(90);
    expect(result['CJ'].avg).toBeCloseTo(120);
  });

  it('skips entries with no store', () => {
    const history = [
      { price: 80, store: null, date: '2026-01-01', type: 'purchase' as const },
      purchase(100, 'Big C'),
    ];
    const result = compareStores(history);
    expect(Object.keys(result)).toEqual(['Big C']);
  });
});
