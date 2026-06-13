export type StockStatus = 'out' | 'low' | 'ok';

interface StockInput {
  currentStock: number;
  lowStockThreshold: number | null;
}

export function stockStatus({ currentStock, lowStockThreshold }: StockInput): StockStatus {
  if (currentStock <= 0) return 'out';
  if (lowStockThreshold !== null && currentStock <= lowStockThreshold) return 'low';
  return 'ok';
}
