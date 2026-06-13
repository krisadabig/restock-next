export const ENTRY_TYPE = {
  PURCHASE: 'purchase',
  CONSUME: 'consume',
} as const;
export type EntryType = (typeof ENTRY_TYPE)[keyof typeof ENTRY_TYPE];

export const ROUTES = {
  STOCK: '/app',
  PRICE: '/app/price',
  SETTINGS: '/app/settings',
  ITEM: (id: number) => `/app/item/${id}`,
  CATEGORY: (id: number) => `/app/category/${id}`,
  LOGIN: '/login',
} as const;

export const THRESHOLDS = {
  SALE_FLAG_RATIO: 0.85,
  PARTNER_TAG_HOURS: 48,
  ACTIVITY_STRIP_HOURS: 24,
} as const;

export const DEFAULTS = {
  UNIT: 'pcs',
  RECENT_CHIPS_STRIP: 4,
  RECENT_CHIPS_GRID: 6,
  SESSION_DURATION_MS: 7 * 24 * 60 * 60 * 1000,
} as const;

export const UNIT_OPTIONS = ['pcs', 'bottle', 'pack', 'kg', 'g', 'L', 'ml', 'box', 'bag'] as const;
