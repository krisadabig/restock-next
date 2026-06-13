interface PurchaseEntry {
  price: number | null;
  store: string | null;
  date: string;
  type: string; // accepts 'purchase' | 'consume' — filtered internally
}

export interface PriceStats {
  avg: number;
  best: number;
  last: number;
  dealSignal: boolean;
}

export function calculatePriceStats(purchases: PurchaseEntry[]): PriceStats | null {
  const valid = purchases.filter((e) => e.type === 'purchase' && e.price !== null) as (PurchaseEntry & { price: number })[];
  if (valid.length === 0) return null;

  const prices = valid.map((e) => e.price);
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const best = Math.min(...prices);
  const last = prices[0]; // newest first from DB

  return { avg, best, last, dealSignal: last < avg };
}

export interface StoreStats {
  avg: number;
  count: number;
}

export function compareStores(purchases: PurchaseEntry[]): Record<string, StoreStats> {
  const result: Record<string, { total: number; count: number }> = {};

  for (const e of purchases) {
    if (!e.store || e.price === null) continue;
    result[e.store] ??= { total: 0, count: 0 };
    result[e.store].total += e.price;
    result[e.store].count += 1;
  }

  return Object.fromEntries(
    Object.entries(result).map(([store, { total, count }]) => [
      store,
      { avg: total / count, count },
    ]),
  );
}
