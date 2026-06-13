# Build Status

> The single source of truth for what's done and what's next.
> A fresh `/goal` session reads this file first to orient itself.
> **Rule**: mark a task `✅` here before ending any session.

## Legend
- ✅ Done — implemented, tests pass, build clean
- 🔲 Todo — not yet started
- 🚧 In Progress — started in a session that didn't finish

---

## NEXT UP

> The first `🔲` task below is always the next task for `/goal`.

---

## Constants & DRY (do this before any new feature work)

| Status | Task | Key Files |
|---|---|---|
| ✅ | **Extract shared constants** | `src/lib/constants.ts` |

<details for "Extract shared constants">

Create `src/lib/constants.ts` with all reused literals and business-rule numbers. Then update every existing file that currently hardcodes these values to import from constants instead.

**Constants to define:**

```ts
// Entry types — used in 15+ places today
export const ENTRY_TYPE = {
  PURCHASE: 'purchase',
  CONSUME:  'consume',
} as const;
export type EntryType = typeof ENTRY_TYPE[keyof typeof ENTRY_TYPE];

// App routes — used in BottomNav, AppShell, login page, proxy
export const ROUTES = {
  STOCK:       '/app',
  PRICE:       '/app/price',
  SETTINGS:    '/app/settings',
  ITEM:        (id: number) => `/app/item/${id}`,
  CATEGORY:    (id: number) => `/app/category/${id}`,
  LOGIN:       '/login',
} as const;

// Business-rule thresholds — must match ux-spec.md wording
export const THRESHOLDS = {
  SALE_FLAG_RATIO:        0.85, // price/avg < 0.85 → >15% below avg → show 🏷️
  PARTNER_TAG_HOURS:      48,   // show "Sam·2h" on item card within 48h of partner logging
  ACTIVITY_STRIP_HOURS:   24,   // hide activity strip if no partner activity for 24h
} as const;

// UI defaults
export const DEFAULTS = {
  UNIT:                    'pcs',
  RECENT_CHIPS_STRIP:      4,   // QuickLogStrip on Stock screen
  RECENT_CHIPS_GRID:       6,   // item chip grid in LogEntrySheet
  SESSION_DURATION_MS:     7 * 24 * 60 * 60 * 1000,
} as const;
```

**Files to update (replace hardcoded values with imports):**

| File | What to replace |
|---|---|
| `src/app/app/actions.ts` | `'purchase'`, `'consume'` → `ENTRY_TYPE.PURCHASE/CONSUME` |
| `src/app/app/AppShell.tsx` | `'/app'` → `ROUTES.STOCK` |
| `src/app/login/page.tsx` | `'/app'` → `ROUTES.STOCK` |
| `src/proxy.ts` | `'/app'`, `'/login'` → `ROUTES.STOCK`, `ROUTES.LOGIN` |
| `src/components/dashboard/BottomNav.tsx` | all route strings → `ROUTES.*` |
| `src/components/entry/LogEntrySheet.tsx` | `'purchase'`, `'consume'` → `ENTRY_TYPE.*`; `'pcs'` → `DEFAULTS.UNIT` |
| `src/components/entry/EditEntrySheet.tsx` | `'purchase'`, `'consume'` → `ENTRY_TYPE.*` |
| `src/components/item/ItemDetailClient.tsx` | `'purchase'`, `'consume'` → `ENTRY_TYPE.*` |
| `src/components/item/ItemHistoryRow.tsx` | `'purchase'` → `ENTRY_TYPE.PURCHASE` |
| `src/components/item/SaleFlagBadge.tsx` | `0.85` → `THRESHOLDS.SALE_FLAG_RATIO` |
| `src/components/providers/UIContext.tsx` | `'purchase'`, `'consume'` type literals → `EntryType` |
| `src/components/providers/OfflineContext.tsx` | `'purchase'`, `'consume'` → `ENTRY_TYPE.*` |
| `src/lib/price.ts` | `'purchase'` → `ENTRY_TYPE.PURCHASE` |
| `src/lib/queries.ts` | `'purchase'` → `ENTRY_TYPE.PURCHASE` |
| `src/lib/session.ts` | `7 * 24 * 60 * 60 * 1000` → `DEFAULTS.SESSION_DURATION_MS` |
| `src/lib/db/schema.ts` | `'pcs'` default → `DEFAULTS.UNIT` (import carefully — schema file runs at DB level) |

**Tests:**
- No new test file needed — all existing tests still pass (pure rename, no behaviour change)
- Run `bun run test:unit` after to confirm zero regressions

**After this task**, all upcoming components (`ActivityStrip`, `QuickLogStrip`, `QuickLogSheet`, `LogEntrySheet` UX pass) must import from `constants.ts` instead of hardcoding any of these values.

</details>

---

## Foundation

| Status | Task | Key Files |
|---|---|---|
| ✅ | Schema + migrations | `src/lib/db/schema.ts` |
| ✅ | Server actions (items / entries / categories) | `src/app/app/actions.ts` |
| ✅ | Authorization tests (householdId guard) | `src/app/app/actions.test.ts` |
| ✅ | Session + auth | `src/lib/auth.ts`, `src/lib/server/session.ts` |
| ✅ | Price calculation utils | `src/lib/price.ts`, `src/lib/price.test.ts` |
| ✅ | Stock calculation utils | `src/lib/stock.ts`, `src/lib/stock.test.ts` |
| ✅ | IndexedDB offline layer | `src/lib/idb.ts`, `src/lib/idb.test.ts` |
| ✅ | Logger | `src/lib/logger.ts` |
| ✅ | i18n (EN + TH) | `src/lib/i18n.tsx` |
| ✅ | Queries | `src/lib/queries.ts` |

## Providers & Context

| Status | Task | Key Files |
|---|---|---|
| ✅ | `HouseholdContext` | `src/components/providers/HouseholdContext.tsx` |
| ✅ | `OfflineContext` | `src/components/providers/OfflineContext.tsx` |
| ✅ | `UIContext` | `src/components/providers/UIContext.tsx` |
| ✅ | `Providers` root wrapper | `src/components/Providers.tsx` |

## Navigation

| Status | Task | Key Files |
|---|---|---|
| ✅ | `BottomNav` (3 tabs + FAB) | `src/components/dashboard/BottomNav.tsx` |

## Stock Screen

| Status | Task | Key Files |
|---|---|---|
| ✅ | `StockClient` | `src/components/stock/StockClient.tsx` |
| ✅ | `StockItemCard` | `src/components/stock/StockItemCard.tsx` |
| ✅ | `CategoryGroup` | `src/components/stock/CategoryGroup.tsx` |
| ✅ | `StockStatusBadge` | `src/components/stock/StockStatusBadge.tsx` |
| ✅ | `LowStockRail` | `src/components/stock/LowStockRail.tsx` |
| ✅ | `/app` page (Stock route) | `src/app/app/page.tsx` |
| ✅ | **Stock Screen: shared visibility + quick log** | Spec: `ux-spec.md §Screen 1` |

<details for "Stock Screen: shared visibility + quick log">

Sub-tasks (implement in this order, all in one session):
1. `ActivityStrip` (new) — horizontal scrollable strip below header showing partner name + item chips. Hidden when no partner activity in last 24h. File: `src/components/stock/ActivityStrip.tsx`
2. `QuickLogStrip` (new) — horizontal chip strip of 4 most recently logged items. Tap → opens `QuickLogSheet`. File: `src/components/stock/QuickLogStrip.tsx`
3. `StockItemCard` partner tag — add muted "Sam·2h" line below last price when the other household member was the last logger within 48h. Modify: `src/components/stock/StockItemCard.tsx`
4. Wire `ActivityStrip` + `QuickLogStrip` into `StockClient` layout (below header, above LowStockRail).
5. Tests: `ActivityStrip.test.tsx` (hidden when no activity, shows partner name + chips), `QuickLogStrip.test.tsx` (renders recent items, fires onSelect), `StockItemCard.test.tsx` (partner tag shown/hidden correctly).

</details>

## Quick Log Micro-sheet (Screen 5a)

| Status | Task | Key Files |
|---|---|---|
| ✅ | **QuickLogSheet** | Spec: `ux-spec.md §Screen 5a` |

<details for "QuickLogSheet">

Sub-tasks (all in one session):
1. `QuickLogSheet` (new bottom sheet) — receives a pre-known item; no item selection step. Layout: Purchase/Consume toggle → qty stepper `[−] n [+]` with unit as read-only label → price pre-confirm "฿89 (same as last)" with `[Change]` → last store pre-selected → Save. File: `src/components/entry/QuickLogSheet.tsx`
2. Wire into `UIContext`: add `isQuickLogOpen`, `setQuickLogOpen`, `quickLogItemId`.
3. Connect `QuickLogStrip` chip tap → open `QuickLogSheet` with the tapped item's id.
4. Tests: confirm-wiring (Save calls mutation), consume mode hides price+store, `[Change]` reveals price input, unit label is not editable.

</details>

## Log Entry Sheet (Screen 5 — UX improvements)

| Status | Task | Key Files |
|---|---|---|
| ✅ | `LogEntrySheet` — base implementation | `src/components/entry/LogEntrySheet.tsx` |
| ✅ | **LogEntrySheet UX pass** | Spec: `ux-spec.md §Screen 5` |

<details for "LogEntrySheet UX pass">

Sub-tasks (all in one session, all modify `src/components/entry/LogEntrySheet.tsx`):
1. **Item selection** — replace the dropdown/autocomplete with a chip grid of the 6 most recently logged items (across both household members). Typing below the grid still filters all items. Selecting a chip pre-fills qty, unit label, price, store.
2. **Quantity stepper** — replace the number `<input>` with `[−] n [+]` inline stepper. Last qty pre-filled.
3. **Unit as label** — unit is a read-only text label next to the stepper, not a separate field. Add a small `[≠ unit]` link that opens a compact unit picker (list of previously used units for this item + free-text option). Changing unit here applies to this entry only, not the item default.
4. **Price pre-confirm** — when an item is selected and a previous price exists, show "฿89 (same as last)" as confirmed state (no keyboard needed). Tap `[Change]` to open numeric input. If no prior price, show empty input directly.
5. **Date as label** — show "Today, Jun 12" as a label (not an input). Tap `[≠]` to open a date picker.
6. **Tests** — update `LogEntrySheet.test.tsx` to cover: chip grid renders recent items, stepper increments/decrements, unit shown as label, price pre-confirm confirmed by default, `[Change]` opens input, date defaults to today label.

</details>

## Item Detail Screen

| Status | Task | Key Files |
|---|---|---|
| ✅ | `ItemDetailClient` | `src/components/item/ItemDetailClient.tsx` |
| ✅ | `PriceIntelligencePanel` | `src/components/item/PriceIntelligencePanel.tsx` |
| ✅ | `DealSignalBadge` | `src/components/item/DealSignalBadge.tsx` |
| ✅ | `ItemHistoryRow` | `src/components/item/ItemHistoryRow.tsx` |
| ✅ | `SaleFlagBadge` | `src/components/item/SaleFlagBadge.tsx` |
| ✅ | `/app/item/[id]` page | `src/app/app/item/[id]/page.tsx` |

## Category View Screen

| Status | Task | Key Files |
|---|---|---|
| ✅ | `CategoryClient` | `src/components/category/CategoryClient.tsx` |
| ✅ | `ItemComparisonTable` | `src/components/category/ItemComparisonTable.tsx` |
| ✅ | `SpendBarChart` | `src/components/category/SpendBarChart.tsx` |
| ✅ | `/app/category/[id]` page | `src/app/app/category/[id]/page.tsx` |

## Price Screen

| Status | Task | Key Files |
|---|---|---|
| ✅ | `PriceClient` | `src/components/price/PriceClient.tsx` |
| ✅ | `CategorySpendRow` | `src/components/price/CategorySpendRow.tsx` |
| ✅ | `RecentPurchaseRow` | `src/components/price/RecentPurchaseRow.tsx` |
| ✅ | `StoreBreakdown` | `src/components/price/StoreBreakdown.tsx` |
| ✅ | `TimeRangeSelector` | `src/components/price/TimeRangeSelector.tsx` |
| ✅ | `/app/price` page | `src/app/app/price/page.tsx` |

## Edit / Delete Sheets

| Status | Task | Key Files |
|---|---|---|
| ✅ | `EditEntrySheet` | `src/components/entry/EditEntrySheet.tsx` |
| ✅ | `DeleteEntryModal` | `src/components/entry/DeleteEntryModal.tsx` |
| ✅ | `EditItemSheet` | `src/components/item/EditItemSheet.tsx` |
| ✅ | `DeleteItemModal` | `src/components/item/DeleteItemModal.tsx` |

## Settings Screen

| Status | Task | Key Files |
|---|---|---|
| ✅ | `SettingsClient` | `src/app/app/settings/SettingsClient.tsx` |
| ✅ | `/app/settings` page | `src/app/app/settings/page.tsx` |

## Shared UI Primitives

| Status | Task | Key Files |
|---|---|---|
| ✅ | `Autocomplete` (extended) | `src/components/ui/Autocomplete.tsx` |
| ✅ | `PillSelector` | `src/components/ui/PillSelector.tsx` |

## Backlog (not yet scheduled)

| Status | Task | Notes |
|---|---|---|
| 🔲 | i18n test coverage — no-missing-keys guard | backlog.md |
| 🔲 | Group feature — full life-cycle | backlog.md |
