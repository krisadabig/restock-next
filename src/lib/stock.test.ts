import { describe, it, expect } from 'vitest';
import { stockStatus } from './stock';

describe('stockStatus', () => {
  it('returns "out" when currentStock is 0', () => {
    expect(stockStatus({ currentStock: 0, lowStockThreshold: null })).toBe('out');
  });

  it('returns "out" when currentStock is negative', () => {
    expect(stockStatus({ currentStock: -1, lowStockThreshold: null })).toBe('out');
  });

  it('returns "ok" when in stock and no threshold set', () => {
    expect(stockStatus({ currentStock: 5, lowStockThreshold: null })).toBe('ok');
  });

  it('returns "low" when stock is at or below threshold', () => {
    expect(stockStatus({ currentStock: 2, lowStockThreshold: 2 })).toBe('low');
    expect(stockStatus({ currentStock: 1, lowStockThreshold: 2 })).toBe('low');
  });

  it('returns "ok" when stock is above threshold', () => {
    expect(stockStatus({ currentStock: 3, lowStockThreshold: 2 })).toBe('ok');
  });

  it('ignores threshold when threshold is null', () => {
    expect(stockStatus({ currentStock: 1, lowStockThreshold: null })).toBe('ok');
  });
});
