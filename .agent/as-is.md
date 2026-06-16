# Restock — App As-Is

> **What this file is**: A snapshot of what is actually built and working right now.
> Read this before touching any code. Update this in the same session you change something.
>
> **What this file is not**: A plan, a wishlist, or a spec. Those live in `ux-spec.md`, `data-model-spec.md`, and `build-status.md`.
>
> **Update rule**: Any session that adds, removes, or changes a route / server action / schema column / context API / component interface must update the relevant section here before marking the task done.

---

## 1. Routes

| Route | Page File | Client Component | Auth Guard | Data Fetched |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` | `HeroSection`, `FeatureSection` | None | None |
| `/login` | `src/app/login/page.tsx` | inline | None | None |
| `/app` | `src/app/app/page.tsx` | `StockClient` | Session → redirect `/login` | `getHouseholdItems()` — items grouped by category with last entry |
| `/app/item/[id]` | `src/app/app/item/[id]/page.tsx` | `ItemDetailClient` | Session + householdId ownership | item, category, allEntries, purchaseHistory |
| `/app/category/[id]` | `src/app/app/category/[id]/page.tsx` | `CategoryClient` | Session + householdId ownership | category, items, purchaseEntries, monthlySpend |
| `/app/price` | `src/app/app/price/page.tsx` | `PriceClient` | Session | spend by range, categorySpend, recentPurchases, storeSpend |
| `/app/settings` | `src/app/app/settings/page.tsx` | `SettingsClient` | Session | members, categories, stores, groups (with items), allItems |
| `/api/auth` | `src/app/api/auth/route.ts` | — | None | Handles login / register / passkey |

**Deprecated routes still present (redirect only):**
- `/app/inventory` → `/app`
- `/app/inventory/[item]` → `/app`
- `/app/trends` → `/app/price`

**Layout:** `src/app/app/layout.tsx` wraps all `/app/*` routes with `HouseholdProvider` (initialized server-side from session) and `AppShell` (renders `BottomNav` + `ClientLayout`).

---

## 2. Database Schema

File: `src/lib/db/schema.ts`

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | uuid |
| `username` | `text` UNIQUE NOT NULL | |
| `email` | `text` | nullable |
| `password_hash` | `text` | nullable (passkey users may have no password) |

### `authenticators`
| Column | Type | Notes |
|---|---|---|
| `credential_id` | `text` PK | |
| `credential_public_key` | `text` NOT NULL | |
| `counter` | `integer` NOT NULL | |
| `transports` | `text` | nullable |
| `user_id` | `text` FK→users | cascade delete |

### `households`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | uuid |
| `name` | `text` NOT NULL | |
| `created_at` | `timestamp` | defaultNow |

### `household_members`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `household_id` | `text` FK→households | cascade delete |
| `user_id` | `text` FK→users | cascade delete |
| `joined_at` | `timestamp` | defaultNow |
| — | UNIQUE | `(household_id, user_id)` |

### `categories`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `household_id` | `text` FK→households | cascade delete |
| `name` | `text` NOT NULL | |
| `default_unit` | `text` NOT NULL | default `'pcs'` |
| `created_at` | `timestamp` | defaultNow |

### `items`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `household_id` | `text` FK→households | cascade delete |
| `category_id` | `integer` FK→categories | set null on delete; nullable |
| `name` | `text` NOT NULL | |
| `unit` | `text` NOT NULL | default `'pcs'`; the item's canonical unit |
| `current_stock` | `real` NOT NULL | default `0`; updated by entry mutations atomically |
| `low_stock_threshold` | `real` | nullable; null = no alert |
| `alert_enabled` | `integer` NOT NULL | default `1`; `0` = alerts muted |
| `last_entry_at` | `timestamp` | nullable; set on every entry mutation |
| `created_at` | `timestamp` | defaultNow |
| `updated_at` | `timestamp` | defaultNow |

Indexes: `idx_items_household(household_id)`, `idx_items_category(category_id)`

### `entries`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `household_id` | `text` FK→households | cascade delete |
| `item_id` | `integer` FK→items | set null on delete; nullable |
| `type` | `text` NOT NULL | `'purchase'` or `'consume'`; default `'purchase'` |
| `price` | `real` | null for consume entries |
| `quantity` | `real` NOT NULL | default `1` |
| `unit` | `text` NOT NULL | default `'pcs'`; per-entry unit (may differ from item unit) |
| `store` | `text` | free text ("Big C", "CJ"); null for consume |
| `date` | `text` NOT NULL | `YYYY-MM-DD` string |
| `note` | `text` | nullable |
| `user_id` | `text` FK→users | cascade delete; attribution |
| `created_at` | `timestamp` | defaultNow |

Indexes: `idx_entries_item_id`, `idx_entries_household_date`, `idx_entries_household_created`

### `groups`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `household_id` | `text` FK→households | cascade delete |
| `name` | `text` NOT NULL | |
| `created_at` | `timestamp` | defaultNow |

Index: `idx_groups_household(household_id)`

### `group_items`
| Column | Type | Notes |
|---|---|---|
| `group_id` | `integer` FK→groups | cascade delete |
| `item_id` | `integer` FK→items | cascade delete |
| — | UNIQUE | `(group_id, item_id)` |

---

## 3. Server Actions

File: `src/app/app/actions.ts`

All actions call `requireSession()` first, which:
1. Calls `getSession()` — throws `'Unauthorized'` if no session
2. Calls `getHouseholdForUser(db, userId)` — throws `'No household found for user'` if not in a household
3. Returns `{ userId, username, householdId }`

Record-level authorization: actions that accept an ID re-fetch the record and compare its `householdId` to the session's `householdId`, throwing `'Not found'` if mismatched.

### Category
| Action | Signature | Returns | Side effects |
|---|---|---|---|
| `addCategory` | `(raw: { name, defaultUnit? })` | `Category` | `revalidatePath('/app')` |
| `getCategories` | `()` | `Category[]` | — |

### Item
| Action | Signature | Returns | Side effects |
|---|---|---|---|
| `addItem` | `(raw: { name, unit?, categoryId? })` | `Item` | `revalidatePath('/app')` |
| `updateItem` | `(id, raw: { name?, unit?, categoryId?, lowStockThreshold?, alertEnabled? })` | `Item` | revalidates `/app` + `/app/item/[id]` |
| `deleteItem` | `(id)` | `void` | revalidates `/app`; also deletes all entries (cascade) |
| `getHouseholdItems` | `()` | `Array<{ item, category, lastEntry }>` | — |
| `getItemsForAutocomplete` | `()` | `Array<{ id, name, unit, categoryName, lastQty, lastPrice, lastStore }>` — ordered by `lastEntryAt DESC NULLS LAST` | — |

### Entry
| Action | Signature | Returns | Side effects |
|---|---|---|---|
| `addEntry` | `(raw: { itemId, type, price?, quantity, unit, store?, date, note? })` | `Entry` | Updates `item.currentStock` atomically; revalidates `/app` + `/app/item/[id]` |
| `updateEntry` | `(entryId, raw: { type?, price?, quantity?, unit?, store?, date?, note? })` | `Entry` | Recalculates `item.currentStock`; revalidates `/app` + `/app/item/[id]` |
| `deleteEntry` | `(entryId)` | `void` | Recalculates `item.currentStock`; revalidates `/app` + `/app/item/[id]` |

**Note on consume entries:** `addEntry` strips `price` and `store` to `null` when `type === 'consume'`, regardless of what was passed.

### Group
| Action | Signature | Returns | Side effects |
|---|---|---|---|
| `addGroup` | `(raw: { name })` | `Group` | `revalidatePath('/app/settings')` |
| `renameGroup` | `(id, raw: { name })` | `Group` | `revalidatePath('/app/settings')` |
| `deleteGroup` | `(id)` | `void` | revalidates `/app/settings` + `/app` |
| `getGroups` | `()` | `Group[]` | — |
| `assignItemToGroup` | `(groupId, itemId)` | `void` | `revalidatePath('/app')` |
| `removeItemFromGroup` | `(groupId, itemId)` | `void` | `revalidatePath('/app')` |
| `getGroupItems` | `(groupId)` | `Item[]` | — |

### Space management
| Action | Signature | Returns | Notes |
|---|---|---|---|
| `createSpace` | `(name, displayName)` | `{ spaceId, memberId }` | creates space + member for current user; logs `space.create` |
| `switchSpace` | `(spaceId)` | `void` | validates membership, updates session cookie, revalidates `/app`; throws `'Not a member'` |
| `getMySpaces` | `()` | `Array<{ id, name, displayName, memberId }>` | all spaces current user belongs to |

### Query (read-only)
| Action | Signature | Returns |
|---|---|---|
| `getItemDetail` | `(itemId)` | `{ item, allEntries, purchaseHistory } \| null` |
| `getCategoryDetail` | `(categoryId)` | `{ category, items, monthlySpend } \| null` |
| `getSpaceSpend` | `(from, to)` | spend totals + byCategory breakdown |
| `getRecentPurchases` | `(limit?)` | recent purchase entries with item + category names |
| `getSpaceMembers` | `()` | `Array<{ userId, username, memberId, displayName }>` |

---

## 4. Context Providers

Provider tree (outermost → innermost): `ThemeProvider → OfflineProvider → UIProvider → HouseholdProvider`

Mounted in: `src/components/Providers.tsx` (client), `HouseholdProvider` initialized in `src/app/app/layout.tsx` (server → client boundary).

### `HouseholdContext`
File: `src/components/providers/HouseholdContext.tsx`

```ts
interface HouseholdContextValue {
  householdId: string;
  currentUserId: string;
  members: Array<{ userId: string; username: string }>;
}
// Hook: useHousehold()
```

Initialized server-side from session data in `app/app/layout.tsx`. Read-only — no setters.
`currentUserId` comes from `session.userId` threaded through `layout.tsx` → `ClientLayout` → `HouseholdProvider`.

### `UIContext`
File: `src/components/providers/UIContext.tsx`

```ts
interface UIContextType {
  // Log entry sheet (FAB / quick actions)
  isLogEntrySheetOpen: boolean;
  logEntryPrefillItemId: number | undefined;
  logEntryPrefillType: 'purchase' | 'consume' | undefined;
  setLogEntrySheetOpen: (open: boolean, prefillItemId?: number, prefillType?: 'purchase' | 'consume') => void;

  // Quick Log sheet (chip tap from QuickLogStrip)
  isQuickLogOpen: boolean;
  quickLogItemId: number | null;
  quickLogPrefill: QuickLogPrefill | null; // { itemName, categoryName, unit, lastQty, lastPrice, lastStore }
  setQuickLogOpen: (open: boolean, itemId?: number, prefill?: QuickLogPrefill) => void;

  // Edit item sheet
  isEditItemSheetOpen: boolean;
  editItemTarget: Item | null;
  editItemEntryCount: number;
  setEditItemSheetOpen: (open: boolean, item?: Item, entryCount?: number) => void;

  // Edit entry sheet
  isEditEntrySheetOpen: boolean;
  editEntryTarget: Entry | null;
  setEditEntrySheetOpen: (open: boolean, entry?: Entry) => void;

  // Delete item modal
  isDeleteItemModalOpen: boolean;
  deleteItemTarget: Item | null;
  setDeleteItemModalOpen: (open: boolean, item?: Item) => void;

  // Legacy alias (points to setLogEntrySheetOpen)
  isAddModalOpen: boolean;
  setAddModalOpen: (open: boolean) => void;
}
// Hook: useUI()
// QuickLogPrefill exported from UIContext.tsx for use by StockClient + QuickLogSheet
```

### `OfflineContext`
File: `src/components/providers/OfflineContext.tsx`

```ts
interface OfflineContextType {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  addEntryOffline:    (data: AddEntryPayload) => Promise<void>;
  updateEntryOffline: (id: number, data: Partial<Omit<AddEntryPayload, 'itemId'>>) => Promise<void>;
  deleteEntryOffline: (id: number) => Promise<void>;
  addItemOffline:     (data: Partial<Item>) => Promise<void>;
  updateItemOffline:  (id: number, data: Partial<Item>) => Promise<void>;
  deleteItemOffline:  (id: number) => Promise<void>;
  addCategoryOffline: (data: Partial<Category>) => Promise<void>;
  lastAction: number; // epoch ms, bumped on every mutation — use as useEffect dep to re-render
}
// Hook: useOffline()
```

All mutations queue to IndexedDB via `addPendingMutation()` then call `SyncEngine.sync()` if online.

---

## 5. Key Component Interfaces

Only top-level data-boundary components are listed. Internal presentational components are omitted.

### Stock screen
```ts
// src/components/stock/StockClient.tsx
interface Props {
  itemsByCategory: Array<{
    category: Category | null;
    items: Array<{ item: Item; lastEntry: Entry | null }>;
  }>;
  groups?: Array<{ id: number; name: string; itemIds: number[] }>; // omit when no groups exist
}
// Internally uses useHousehold() to derive partnerActivityItems, partnerTags, recentItems.
// Renders group filter chip strip (data-testid="group-filter-strip") when groups prop is present.
// Group filter composes with existing status/sort filters.
```

```ts
// src/components/stock/StockItemCard.tsx
interface Props {
  item: Item;
  lastEntry: Entry | null;
  onTap: () => void;
  partnerTag?: string; // e.g. "Sam·2h" — pre-computed by StockClient
}
```

```ts
// src/components/stock/ActivityStrip.tsx
interface Props {
  partnerName: string;
  items: Array<{ id: number; name: string }>;
  lastActivityAt: Date;
  onChipTap: (itemId: number) => void;
}
// Hidden (returns null) when items is empty.
```

```ts
// src/components/stock/QuickLogStrip.tsx
interface Props {
  items: Array<{ id: number; name: string }>; // pass up to DEFAULTS.RECENT_CHIPS_STRIP items
  onSelect: (itemId: number) => void;
}
// Hidden (returns null) when items is empty.
```

### Item Detail
```ts
// src/components/item/ItemDetailClient.tsx
interface Props {
  item: Item;
  category: Category | null;
  allEntries: Entry[];
  purchaseHistory: Entry[];
}
```

### Category View
```ts
// src/components/category/CategoryClient.tsx
interface Props {
  category: Category;
  items: Item[];
  purchaseEntries: Entry[];
  monthlySpend: Array<{ month: string; total: number }>;
}
```

### Price screen
```ts
// src/components/price/PriceClient.tsx
interface Props {
  range: 'month' | '3months' | 'year' | 'all';
  totalSpend: { current: number; previous: number };
  categorySpend: Array<{ categoryId: number; categoryName: string; total: number }>;
  recentPurchases: Array<{ entry: Entry; itemId: number; itemName: string; categoryName: string | null }>;
  storeSpend: Array<{ store: string; total: number; count: number }>;
}
```

### Entry sheets
```ts
// src/components/entry/QuickLogSheet.tsx
interface Props {
  isOpen: boolean;
  onClose: () => void;
  itemId: number | null;      // item to log
  prefill: QuickLogPrefill | null; // pre-fills qty/price/store/unit from last entry
}
// Purchase/Consume toggle, qty stepper, price pre-confirm with [Change], store input.
// Consume mode hides price + store. Mounted in AppShell via UIContext.isQuickLogOpen.

// src/components/entry/LogEntrySheet.tsx
interface Props {
  isOpen: boolean;
  onClose: () => void;
  prefillItemId?: number; // auto-selects item on open; pre-fills from last entry
  prefillType?: EntryType; // import from '@/lib/constants'
}
// UX: chip grid (6 recent items), qty stepper, unit as label + [≠ unit] picker,
//     price pre-confirm + [Change], date label + [≠] picker, search input for all items.

// src/components/entry/EditEntrySheet.tsx
interface Props {
  entry: Entry;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (entry: Entry) => void;
}
```

### Item / Delete sheets
```ts
// src/components/item/EditItemSheet.tsx
interface Props {
  item: Item;
  categories: Category[];
  hasEntries?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onDeleteClick: (item: Item) => void;
}

// src/components/ui/BottomSheetContainer.tsx
interface Props {
  isOpen: boolean;
  onClose: () => void;
  testId?: string;
  children: ReactNode;
}
// Handles mounted guard, createPortal, backdrop, and container styling.
// Use this for all bottom sheets — do NOT repeat the portal pattern manually.

// src/components/item/DeleteItemModal.tsx
interface Props {
  item: Item;
  entryCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

// src/components/entry/DeleteEntryModal.tsx
interface Props {
  entry: Entry;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// src/app/app/settings/SettingsClient.tsx
interface Props {
  currentUserId: string;
  members: Array<{ userId: string; username: string }>;
  categories: Category[];
  stores: string[];
  groups: Array<{ id: number; name: string; items: Array<{ id: number; name: string }> }>;
  allItems: Array<{ id: number; name: string }>; // full household item list for assignment UI
}
// Groups section: create/rename/delete groups with inline confirm.
// Each group row has a "Manage items" toggle that expands a checkbox list of allItems.
// Checking an item calls assignItemToGroup(groupId, itemId); unchecking calls removeItemFromGroup.
// Calls addGroup/renameGroup/deleteGroup/assignItemToGroup/removeItemFromGroup server actions, then router.refresh().
```

---

## 6. Auth Flow

- **Session**: JWT stored in httpOnly cookie. `getSession()` → `{ userId, username } | null`.
- **Login**: `POST /api/auth` with `{ action: 'login', username, password }` → sets cookie.
- **Register**: `POST /api/auth` with `{ action: 'register', username, password }` → creates user + space + space_member + sets cookie with `activeSpaceId` + `activeMemberId`.
- **Passkey**: WebAuthn enrollment available in Settings. Not fully E2E tested (deferred, see `backlog.md`).
- **Logout**: `src/app/auth/actions.ts` → clears cookie → redirects `/login`.

---

## 7. Offline / IndexedDB

File: `src/lib/idb.ts`

IDB store: `pending_mutations` — queue of `{ id: uuid, type: MutationType, payload, timestamp }`.

```ts
type MutationType =
  | 'entry.add' | 'entry.update' | 'entry.delete'
  | 'item.add'  | 'item.update'  | 'item.delete'
  | 'category.add';
```

`SyncEngine` (`src/lib/sync.ts`) drains the queue when online, calling the corresponding server action for each mutation type. On success the mutation is removed from IDB.

---

## 8. Utilities

| File | What it exports |
|---|---|
| `src/lib/constants.ts` | `ENTRY_TYPE`, `EntryType`, `ROUTES`, `THRESHOLDS`, `DEFAULTS`, `UNIT_OPTIONS` — **import from here, never hardcode these values** |
| `src/components/ui/Autocomplete.tsx` | `ItemSuggestion` — `{ id, name, categoryName, unit?, lastQty?, lastPrice?, lastStore? }` |
| `src/lib/price.ts` | `calculatePriceStats(purchases)` → `{ avg, best, last, dealSignal }`, `compareStores(purchases)` → `Record<store, { avg, count }>` |
| `src/lib/stock.ts` | `stockStatus({ currentStock, lowStockThreshold })` → `'out' \| 'low' \| 'ok'` |
| `src/lib/queries.ts` | All raw Drizzle queries; consumed by server actions and page components |
| `src/lib/logger.ts` | `log.info(event, payload)`, `log.warn(...)`, `log.error(...)` — wraps Axiom + console |
| `src/lib/i18n.tsx` | `useTranslation()` hook + `t(key)` — EN and TH strings; all UI-visible strings must have keys here. `translations` object is exported for test access. |
| `src/lib/i18n.test.ts` | No-missing-keys guard — asserts EN and TH have identical key sets (3 tests) |
