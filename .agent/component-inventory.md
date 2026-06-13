# Restock — Component Inventory

> **Source**: Maps ux-spec.md screens to the existing codebase (scanned Jun 2026).
> **Reference**: data-model-spec.md for prop types, design.md for visual conventions.
> **Legend**: 🟢 Keep as-is · 🟡 Modify · 🔴 Rewrite · ⚫ Deprecate · 🆕 New

---

## 1. Route Changes

| Current Route | Status | New Route | Reason |
|---|---|---|---|
| `/app` | 🔴 Rewrite | `/app` | Was chronological entry feed → becomes Stock screen |
| `/app/inventory` | ⚫ Deprecate | — | Absorbed into `/app` (Stock screen) |
| `/app/inventory/[item]` | 🔴 Rewrite | `/app/item/[id]` | Item keyed by id not string name; major new content |
| `/app/trends` | 🔴 Rewrite | `/app/price` | Rename reflects purpose; content fully replaced |
| `/app/settings` | 🟡 Modify | `/app/settings` | Add household + stores + categories sections |
| — | 🆕 New | `/app/category/[id]` | Category View screen (new) |

---

## 2. Full Component Status Table

### Routes & Page Components

| File | Status | Action |
|---|---|---|
| `src/app/app/page.tsx` | 🔴 Rewrite | Fetch items grouped by category + last entry per item; pass to `StockClient` |
| `src/app/app/inventory/page.tsx` | ⚫ Deprecate | Delete after migration; redirect `/app/inventory` → `/app` |
| `src/app/app/inventory/[item]/page.tsx` | ⚫ Deprecate | Delete after migration; old string-based routing replaced by id-based |
| `src/app/app/item/[id]/page.tsx` | 🆕 New | Fetch item + all entries + price stats; pass to `ItemDetailClient` |
| `src/app/app/category/[id]/page.tsx` | 🆕 New | Fetch category + items + monthly spend; pass to `CategoryClient` |
| `src/app/app/price/page.tsx` | 🆕 New | Replaces `/app/trends`; fetch household spend summary; pass to `PriceClient` |
| `src/app/app/trends/page.tsx` | ⚫ Deprecate | Redirect `/app/trends` → `/app/price` |
| `src/app/app/settings/page.tsx` | 🟡 Modify | Add household members, stores list, categories list sections |
| `src/app/app/layout.tsx` | 🟡 Modify | Remove old nav items; pass household context |
| `src/app/app/actions.ts` | 🔴 Rewrite | New server actions for items/categories/households; update stock mutations to be atomic |

### Navigation

| File | Status | Action |
|---|---|---|
| `src/components/dashboard/BottomNav.tsx` | 🔴 Rewrite | 5 tabs → 3 tabs (Stock · Price · Settings) + FAB; update routes |

### Stock Screen

| File | Status | Action |
|---|---|---|
| `src/components/dashboard/DashboardClient.tsx` | ⚫ Deprecate | Replaced by `StockClient` |
| `src/components/dashboard/DashboardFilters.tsx` | ⚫ Deprecate | Filter chips move into `StockClient` header inline |
| `src/components/inventory/InventoryClient.tsx` | ⚫ Deprecate | Replaced by `StockClient` |
| `src/components/inventory/InventoryCard.tsx` | ⚫ Deprecate | Replaced by `StockItemCard` |
| `src/components/stock/StockClient.tsx` | 🆕 New | Main Stock screen — items grouped by category |
| `src/components/stock/StockItemCard.tsx` | 🆕 New | Per-item card: name, stock count, status dot, last price + store + date |
| `src/components/stock/CategoryGroup.tsx` | 🆕 New | Category header + its item cards |
| `src/components/stock/StockStatusBadge.tsx` | 🆕 New | green/amber/red dot + label ("In Stock" / "Low" / "Out") |
| `src/components/stock/LowStockRail.tsx` | 🆕 New | Collapsed section pinned at top for out/low items |

### Item Detail Screen

| File | Status | Action |
|---|---|---|
| `src/components/inventory/ItemDetailClient.tsx` | 🔴 Rewrite | Add price intelligence panel, store comparison, history with edit per row |
| `src/components/item/PriceIntelligencePanel.tsx` | 🆕 New | Avg / best / last price + deal signal + store comparison table |
| `src/components/item/DealSignalBadge.tsx` | 🆕 New | "฿89 is 15% below your avg ✓" — shown when last < avg |
| `src/components/item/ItemHistoryRow.tsx` | 🆕 New | Single row in history timeline: icon, qty, price, store, date, edit icon |
| `src/components/item/SaleFlagBadge.tsx` | 🆕 New | 🏷️ badge for entries >15% below item average |

### Category View Screen

| File | Status | Action |
|---|---|---|
| `src/components/category/CategoryClient.tsx` | 🆕 New | Items table + per-unit comparison + total spend + monthly bar chart |
| `src/components/category/ItemComparisonTable.tsx` | 🆕 New | Item rows: name, avg price, best price; highlights cheapest per unit |
| `src/components/category/SpendBarChart.tsx` | 🆕 New | CSS/SVG monthly spend bars — no external library |

### Price Screen (replaces Trends)

| File | Status | Action |
|---|---|---|
| `src/components/dashboard/TrendsClient.tsx` | ⚫ Deprecate | Replaced by `PriceClient` |
| `src/components/price/PriceClient.tsx` | 🆕 New | Total spend + category breakdown + recent purchases + store summary |
| `src/components/price/CategorySpendRow.tsx` | 🆕 New | Category name + spend amount + inline bar |
| `src/components/price/StoreBreakdown.tsx` | 🆕 New | Per-store spend + visit count for selected period |
| `src/components/price/RecentPurchaseRow.tsx` | 🆕 New | Date · item name · price · store — taps to Item Detail |
| `src/components/price/TimeRangeSelector.tsx` | 🆕 New | Horizontal chips: This Month · 3 Months · This Year · All Time |

### Log Entry Sheet (replaces AddEntryModal)

| File | Status | Action |
|---|---|---|
| `src/components/dashboard/AddEntryModal.tsx` | ⚫ Deprecate | Replaced by `LogEntrySheet` |
| `src/components/entry/LogEntrySheet.tsx` | 🆕 New | Bottom sheet: Purchase/Consume toggle, item autocomplete, qty, price, store, date, note |
| `src/components/entry/NewItemInlineForm.tsx` | 🆕 New | Inline expansion inside LogEntrySheet for creating a new item+category without leaving the sheet |

### Edit Entry Sheet (replaces EditEntryModal)

| File | Status | Action |
|---|---|---|
| `src/components/dashboard/EditEntryModal.tsx` | ⚫ Deprecate | Replaced by `EditEntrySheet` |
| `src/components/entry/EditEntrySheet.tsx` | 🆕 New | Same as LogEntrySheet but pre-filled + Delete button at bottom |

### Delete Confirmations

| File | Status | Action |
|---|---|---|
| `src/components/dashboard/DeleteEntryModal.tsx` | 🟡 Modify | Update copy to include stock impact notice; keep portal pattern |
| `src/components/item/DeleteItemModal.tsx` | 🆕 New | Confirm delete item + all its entries; shows entry count |

### Edit Item Sheet

| File | Status | Action |
|---|---|---|
| `src/components/dashboard/ManageInventoryModal.tsx` | ⚫ Deprecate | Replaced by `EditItemSheet` |
| `src/components/item/EditItemSheet.tsx` | 🆕 New | Edit item name, category, unit (with warning) + Delete item trigger |

### Shared / UI Primitives

| File | Status | Action |
|---|---|---|
| `src/components/ui/Autocomplete.tsx` | 🟡 Modify | Suggestions now return `{ id, name, categoryName }` not just strings; show category as subtitle in dropdown |
| `src/components/ui/PillSelector.tsx` | 🟢 Keep | No changes needed |
| `src/components/SkeletonList.tsx` | 🟢 Keep | No changes needed |
| `src/components/ThemeToggle.tsx` | 🟢 Keep | No changes needed |
| `src/components/LanguageToggle.tsx` | 🟢 Keep | No changes needed |
| `src/components/PWARegistry.tsx` | 🟢 Keep | No changes needed |

### Providers & Context

| File | Status | Action |
|---|---|---|
| `src/components/Providers.tsx` | 🟡 Modify | Add `HouseholdProvider` to provider tree |
| `src/components/providers/UIContext.tsx` | 🟡 Modify | Add open states for `EditItemSheet`, `EditEntrySheet`, `DeleteItemModal` |
| `src/components/providers/OfflineContext.tsx` | 🟡 Modify | Add mutation types: `addItem`, `updateItem`, `deleteItem`, `addCategory`; update existing mutations to include `store` + `itemId` |
| `src/components/providers/HouseholdContext.tsx` | 🆕 New | Exposes `householdId`, `members`; reads from session; used by all data-fetching components |

### Landing Page

| File | Status | Action |
|---|---|---|
| `src/components/landing/HeroSection.tsx` | 🟢 Keep | No changes for now |
| `src/components/landing/FeatureSection.tsx` | 🟢 Keep | No changes for now |
| `src/components/landing/Footer.tsx` | 🟢 Keep | No changes needed |
| `src/components/landing/InstallAppSection.tsx` | 🟢 Keep | No changes needed |

---

## 3. New Component Specs

### `StockClient`
```
src/components/stock/StockClient.tsx
```
```ts
interface Props {
  itemsByCategory: Array<{
    category: Category;
    items: Array<ItemWithLastEntry>;
  }>;
  householdId: string;
}
```
- Renders `LowStockRail` (out + low items, collapsed by default)
- Renders `CategoryGroup` for each category
- Horizontal filter chips: All · Out of Stock · Low · A–Z · Recent
- Search input in header
- Reads/writes optimistic state via `OfflineContext`

---

### `StockItemCard`
```
src/components/stock/StockItemCard.tsx
```
```ts
interface Props {
  item: Item;
  lastEntry: Entry | null; // most recent purchase entry
  onTap: () => void;       // navigate to Item Detail
}
```
- Item name, current stock + unit
- `StockStatusBadge` (green/amber/red)
- Last price + store + date (from `lastEntry`)
- Tap → Item Detail

---

### `PriceIntelligencePanel`
```
src/components/item/PriceIntelligencePanel.tsx
```
```ts
interface Props {
  purchases: Entry[];  // all purchase entries for this item, newest first
}
// Derives internally:
// avgPrice, bestPrice, lastPrice, dealSignal, storeAverages
```
- Shows avg / best / last price
- `DealSignalBadge` when lastPrice < avgPrice
- Store comparison table (only when 2+ stores present)
- Empty state when < 2 purchases

---

### `ItemHistoryRow`
```
src/components/item/ItemHistoryRow.tsx
```
```ts
interface Props {
  entry: Entry;
  itemAvgPrice: number;  // for sale flag calculation
  onEdit: (entry: Entry) => void;
}
```
- 🛒 / 📦 icon based on type
- Quantity + price + store (purchase) or quantity only (consume)
- Note below if present
- `SaleFlagBadge` if price > 15% below avgPrice
- Edit icon on right

---

### `LogEntrySheet`
```
src/components/entry/LogEntrySheet.tsx
```
```ts
interface Props {
  isOpen: boolean;
  onClose: () => void;
  prefillItemId?: number;   // set when opened from Item Detail quick actions
  prefillType?: 'purchase' | 'consume';
}
```
- Purchase / Consume toggle
- Item autocomplete (`Autocomplete` component, extended)
- Quantity + unit (pre-filled from item)
- Price + Store (purchase only, hidden on consume)
- Date (today default)
- Note (collapsed)
- Inline "New item" expansion (`NewItemInlineForm`)
- Repeat purchase fast path: last store pre-selected, last qty pre-filled
- Uses `createPortal` (matches existing modal pattern)

---

### `EditEntrySheet`
```
src/components/entry/EditEntrySheet.tsx
```
```ts
interface Props {
  entry: Entry;
  onClose: () => void;
  onDelete: (entry: Entry) => void;
}
```
- Same layout as `LogEntrySheet`, all fields pre-filled
- Type toggle visible — changing type shows/hides price+store
- Delete button at bottom (triggers `DeleteEntryModal`)

---

### `EditItemSheet`
```
src/components/item/EditItemSheet.tsx
```
```ts
interface Props {
  item: Item;
  categories: Category[];
  onClose: () => void;
  onDelete: (item: Item) => void;
}
```
- Name, category dropdown, unit
- Warning shown if unit changed and entries exist: "Changing unit affects how stock is displayed"
- Delete item button at bottom (triggers `DeleteItemModal`)

---

### `CategoryClient`
```
src/components/category/CategoryClient.tsx
```
```ts
interface Props {
  category: Category;
  items: Item[];
  purchaseEntries: Entry[];     // all purchases across all items in category
  monthlySpend: MonthlySpend[]; // pre-aggregated server-side
}
```
- `ItemComparisonTable` (avg + best per item, per-unit comparison if units match)
- Total spend: this month / last month / this year
- `SpendBarChart` (monthly bars)

---

### `PriceClient`
```
src/components/price/PriceClient.tsx
```
```ts
interface Props {
  totalSpend: { current: number; previous: number };
  categorySpend: Array<{ category: Category; total: number }>;
  recentPurchases: Array<Entry & { itemName: string; categoryName: string }>;
  storeSpend: Array<{ store: string; total: number; count: number }>;
}
```
- `TimeRangeSelector` (controls re-fetch via URL search param)
- Total spend + MoM delta
- `CategorySpendRow` list
- Recent purchases list (`RecentPurchaseRow`)
- `StoreBreakdown`

---

### `SpendBarChart`
```
src/components/category/SpendBarChart.tsx
```
```ts
interface Props {
  data: Array<{ month: string; total: number }>;  // YYYY-MM
}
```
- Pure CSS/SVG — no external chart library
- Bar height = (value / max) * 100%
- Month label below each bar
- Matches design.md: uses `--primary` color, glassmorphism card wrapper

---

### `HouseholdContext`
```
src/components/providers/HouseholdContext.tsx
```
```ts
interface HouseholdContextValue {
  householdId: string;
  members: Array<{ userId: string; username: string }>;
}
```
- Initialized from server session on app layout load
- Consumed by `StockClient`, `PriceClient`, `LogEntrySheet` for scoping queries
- Required before any data operation

---

## 4. Modified Component Specs

### `BottomNav` (🔴 Rewrite)
- Remove: History tab, Inventory tab
- Keep: Stock tab (`/app`), Settings tab (`/app/settings`)
- Rename: Trends → Price (`/app/price`)
- FAB: center position removed from nav; becomes absolutely positioned button (bottom-right)
- Result: 3-tab nav + external FAB

### `Autocomplete` (🟡 Modify)
- Current: suggestions are `string[]`
- New: suggestions are `Array<{ id: number; name: string; categoryName: string }>`
- Dropdown option row: item name (bold) + category name (muted, smaller)
- On select: returns `itemId` not item string
- Backwards compat: keep `getUniqueItems` action, add `getItemsWithCategory` action

### `DeleteEntryModal` (🟡 Modify)
- Add line: "This will update your stock count for [item name]."
- No structural changes; keep `createPortal` pattern

### `OfflineContext` (🟡 Modify)
- Add to mutation queue types: `addItem`, `updateItem`, `deleteItem`, `addCategory`
- Update `addEntryOffline` / `updateEntryOffline` to accept `itemId` + `store` fields
- Update IDB stores to include `items` and `categories` caches

### `UIContext` (🟡 Modify)
- Add: `isEditItemSheetOpen`, `setEditItemSheetOpen`, `editItemTarget`
- Add: `isEditEntrySheetOpen`, `setEditEntrySheetOpen`, `editEntryTarget`
- Add: `isDeleteItemModalOpen`, `setDeleteItemModalOpen`, `deleteItemTarget`

---

## 5. Deprecated Components (delete after migration)

| Component | Replace With | Notes |
|---|---|---|
| `DashboardClient.tsx` | `StockClient.tsx` | |
| `DashboardFilters.tsx` | Inline in `StockClient` | |
| `EntryCard.tsx` | `ItemHistoryRow.tsx` | Entry card was for the feed; new version is for item timeline |
| `TimelineModal.tsx` | Item Detail screen | Timeline is now a full screen, not a modal |
| `ManageInventoryModal.tsx` | `EditItemSheet.tsx` | |
| `AddEntryModal.tsx` | `LogEntrySheet.tsx` | |
| `EditEntryModal.tsx` | `EditEntrySheet.tsx` | |
| `InventoryClient.tsx` | `StockClient.tsx` | |
| `InventoryCard.tsx` | `StockItemCard.tsx` | |
| `TrendsClient.tsx` | `PriceClient.tsx` | |

---

## 6. New Directory Structure

```
src/components/
  stock/
    StockClient.tsx          ← Stock screen (main)
    StockItemCard.tsx         ← Per-item card
    CategoryGroup.tsx         ← Category header + cards
    StockStatusBadge.tsx      ← green/amber/red indicator
    LowStockRail.tsx          ← Pinned out/low section

  item/
    ItemDetailClient.tsx      ← Rewrite of existing
    PriceIntelligencePanel.tsx
    DealSignalBadge.tsx
    ItemHistoryRow.tsx
    SaleFlagBadge.tsx
    EditItemSheet.tsx
    DeleteItemModal.tsx

  category/
    CategoryClient.tsx
    ItemComparisonTable.tsx
    SpendBarChart.tsx

  price/
    PriceClient.tsx
    CategorySpendRow.tsx
    StoreBreakdown.tsx
    RecentPurchaseRow.tsx
    TimeRangeSelector.tsx

  entry/
    LogEntrySheet.tsx         ← Replaces AddEntryModal
    EditEntrySheet.tsx        ← Replaces EditEntryModal
    NewItemInlineForm.tsx

  providers/
    HouseholdContext.tsx      ← New
    UIContext.tsx             ← Modified
    OfflineContext.tsx        ← Modified

  ui/
    Autocomplete.tsx          ← Modified
    PillSelector.tsx          ← Unchanged

  dashboard/                  ← All deprecated, delete after migration
  inventory/                  ← All deprecated, delete after migration
```

---

## 7. Implementation Order

Build in this sequence to avoid blocking dependencies:

```
1. Schema migration (data-model-spec.md Phase 1 + 2)
   └── New tables + backfill script

2. Server actions (actions.ts rewrite)
   └── addItem, updateItem, deleteItem
   └── addCategory
   └── addEntry (updated: itemId + store)
   └── updateEntry (atomic stock correction)
   └── deleteEntry (atomic stock reversal)
   └── getItemsWithCategory (for autocomplete)
   └── getHouseholdItems (for Stock screen)
   └── getPriceStats (for Item Detail)
   └── getCategorySpend (for Category View + Price screen)

3. Providers
   └── HouseholdContext
   └── UIContext (additions)
   └── OfflineContext (new mutation types)

4. Shared primitives
   └── Autocomplete (modified)
   └── StockStatusBadge
   └── DealSignalBadge
   └── SaleFlagBadge
   └── SpendBarChart
   └── TimeRangeSelector

5. Log/Edit sheets (needed by all screens)
   └── LogEntrySheet
   └── EditEntrySheet
   └── NewItemInlineForm
   └── EditItemSheet
   └── DeleteItemModal
   └── DeleteEntryModal (modified)

6. Stock screen
   └── StockItemCard
   └── CategoryGroup
   └── LowStockRail
   └── StockClient
   └── /app page.tsx (rewrite)

7. Item Detail screen
   └── PriceIntelligencePanel
   └── ItemHistoryRow
   └── ItemDetailClient (rewrite)
   └── /app/item/[id] page.tsx (new)

8. Category View screen
   └── ItemComparisonTable
   └── CategoryClient
   └── /app/category/[id] page.tsx (new)

9. Price screen
   └── CategorySpendRow
   └── StoreBreakdown
   └── RecentPurchaseRow
   └── PriceClient
   └── /app/price page.tsx (new)

10. Navigation + Settings
    └── BottomNav (rewrite)
    └── /app/settings page.tsx (additions)

11. Cleanup
    └── Delete deprecated components
    └── Delete deprecated routes
    └── Redirect /app/inventory → /app
    └── Redirect /app/trends → /app/price
```
