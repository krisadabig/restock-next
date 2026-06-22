# Restock — App As-Is

> **What this file is**: A snapshot of what is actually built and working right now.
> Read this before touching any code. Update this in the same session you change something.
>
> **What this file is not**: A plan, a wishlist, or a spec. Those live in `ux-spec.md`, `data-model-spec.md`, and `build-status.md`.
>
> **Update rule**: Any session that adds, removes, or changes a route / server action / schema column / context API / component interface must update the relevant section here before marking the task done.
>
> **Grep guide**: Each section has a machine-greppable anchor comment `<!-- AS-IS.<DOMAIN> -->`.
> Subagents: grep for `AS-IS.ROUTE`, `AS-IS.SCHEMA`, `AS-IS.ACTION`, `AS-IS.CONTEXT`, `AS-IS.COMPONENT`, `AS-IS.IDB`, `AS-IS.UTIL` to find the relevant section fast.

---

<!-- AS-IS.ROUTE -->
## 1. Routes

| Route | Page File | Client Component | Auth Guard | Data Fetched |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` | `HeroSection`, `FeatureSection`, `InstallAppSection`, `Footer` | None | None |
| `/login` | `src/app/login/page.tsx` | inline | None | None |
| `/app` | `src/app/app/page.tsx` | `StockClient` | Session → redirect `/login` | `getSpaceItems()` — items grouped by category with last entry |
| `/app/item/[id]` | `src/app/app/item/[id]/page.tsx` | `ItemDetailClient` | Session + spaceId ownership | item, category, allEntries, purchaseHistory |
| `/app/category/[id]` | `src/app/app/category/[id]/page.tsx` | `CategoryClient` | Session + spaceId ownership | category, items, purchaseEntries, monthlySpend |
| `/app/price` | `src/app/app/price/page.tsx` | `PriceClient` | Session | spend by range, categorySpend, recentPurchases, storeSpend |
| `/app/settings` | `src/app/app/settings/page.tsx` | `SettingsClient` | Session | members, categories, stores |
| `/api/auth` | `src/app/api/auth/route.ts` | — | None | Handles login / register / passkey |

**Layout:** `src/app/app/layout.tsx` (server component) — calls `requireSession()`, fetches `getActiveSpaceForUser`, `getSpaceMembers`, `getCategories`, `getUserSpaces`, builds `SpaceContextValue`, passes to `ClientLayout`.

`src/app/app/ClientLayout.tsx` (client) — mounts provider tree: `SpaceProvider → OfflineProvider → UIProvider → AppShell`.

---

<!-- AS-IS.SCHEMA -->
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

### `spaces`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | uuid |
| `name` | `text` NOT NULL | |
| `created_at` | `timestamp` | defaultNow |

### `space_members`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `space_id` | `text` FK→spaces | cascade delete |
| `user_id` | `text` FK→users | cascade delete |
| `display_name` | `text` NOT NULL | per-space identity |
| `avatar` | `text` | nullable |
| `joined_at` | `timestamp` | defaultNow |
| — | UNIQUE | `(space_id, user_id)` |

### `space_invites`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `space_id` | `text` FK→spaces | cascade delete |
| `code` | `text` UNIQUE NOT NULL | 8-char alphanumeric |
| `created_by` | `integer` FK→space_members | cascade delete |
| `expires_at` | `timestamp` NOT NULL | now() + 48h |
| `used_at` | `timestamp` | nullable; set when claimed |
| `created_at` | `timestamp` | defaultNow |

### `categories`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `space_id` | `text` FK→spaces | cascade delete |
| `name` | `text` NOT NULL | |
| `default_unit` | `text` NOT NULL | default `'pcs'` |
| `created_at` | `timestamp` | defaultNow |

### `items`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `space_id` | `text` FK→spaces | cascade delete |
| `category_id` | `integer` FK→categories | set null on delete; nullable |
| `name` | `text` NOT NULL | |
| `unit` | `text` NOT NULL | default `'pcs'` |
| `current_stock` | `real` NOT NULL | default `0`; updated atomically by entry mutations |
| `low_stock_threshold` | `real` | nullable; null = no alert |
| `alert_enabled` | `boolean` NOT NULL | default `true` |
| `last_entry_at` | `timestamp` | nullable; set on every entry mutation |
| `created_at` | `timestamp` | defaultNow |
| `updated_at` | `timestamp` | defaultNow |

Indexes: `idx_items_space(space_id)`, `idx_items_category(category_id)`

### `entries`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `space_id` | `text` FK→spaces | cascade delete |
| `item_id` | `integer` FK→items | set null on delete; nullable |
| `member_id` | `integer` FK→space_members | cascade delete; attribution |
| `type` | `text` NOT NULL | `'purchase'` or `'consume'`; default `'purchase'` |
| `price` | `real` | null for consume entries |
| `quantity` | `real` NOT NULL | default `1` |
| `unit` | `text` NOT NULL | default `'pcs'`; per-entry unit |
| `store` | `text` | free text; null for consume |
| `date` | `date` NOT NULL | `YYYY-MM-DD` |
| `note` | `text` | nullable |
| `created_at` | `timestamp` | defaultNow |

Indexes: `idx_entries_item_id`, `idx_entries_space_date`, `idx_entries_space_created`

**Removed tables:** `households`, `household_members`, `groups`, `group_items` — deleted in redesign migration.

---

<!-- AS-IS.ACTION -->
## 3. Server Actions

File: `src/app/app/actions.ts`

All actions call `requireSession()` first (`src/lib/session.ts`), which returns `{ userId, spaceId, memberId }` or throws `'Unauthorized'` / `'No active space'`.

Record-level auth guard: fetch record, compare `record.spaceId !== spaceId` → throw `'Not found'`.

### Category
| Action | Signature | Returns | Side effects |
|---|---|---|---|
| `addCategory` | `(raw: { name, defaultUnit? })` | `Category` | `revalidatePath('/app')` |
| `getCategories` | `()` | `Category[]` | — |
| `updateCategory` | `(id, raw: { name?, defaultUnit? })` | `Category` | revalidates `/app`; auth guard |
| `deleteCategory` | `(id)` | `void` | revalidates `/app` + `/app/settings`; auth guard |

### Item
| Action | Signature | Returns | Side effects |
|---|---|---|---|
| `addItem` | `(raw: { name, unit?, categoryId? })` | `Item` | `revalidatePath('/app')` |
| `updateItem` | `(id, raw: { name?, unit?, categoryId?, lowStockThreshold?, alertEnabled? })` | `Item` | revalidates `/app` + `/app/item/[id]`; auth guard |
| `deleteItem` | `(id)` | `void` | revalidates `/app`; cascade deletes entries; auth guard |
| `getSpaceItems` | `()` | `Array<{ item, category, lastEntry, lastMember: { displayName } }>` | — |
| `getItemsForAutocomplete` | `()` | `Array<{ id, name, unit, categoryName, lastQty, lastPrice, lastStore }>` ordered by `lastEntryAt DESC` | — |

### Entry
| Action | Signature | Returns | Side effects |
|---|---|---|---|
| `addEntry` | `(raw: { itemId, type, price?, quantity, unit, store?, date, note? })` | `Entry` | Updates `item.currentStock` atomically; revalidates `/app` + `/app/item/[id]`; uses `memberId` from session |
| `updateEntry` | `(entryId, raw: { type?, price?, quantity?, unit?, store?, date?, note? })` | `Entry` | Recalculates `item.currentStock`; auth guard |
| `deleteEntry` | `(entryId)` | `void` | Reverses `item.currentStock`; auth guard |

**Consume rule:** `addEntry` strips `price` and `store` to `null` when `type === 'consume'`.

### Space & member
| Action | Signature | Returns | Notes |
|---|---|---|---|
| `createSpace` | `(name, displayName)` | `{ spaceId, memberId }` | Creates space + space_member; logs `space.create` |
| `switchSpace` | `(spaceId)` | `void` | Validates membership, updates session, `revalidatePath('/app')`; throws `'Not a member'` |
| `getMySpaces` | `()` | `Array<{ id, name, displayName, memberId }>` | All spaces the current user belongs to |
| `updateMemberProfile` | `({ displayName?, avatar? })` | `SpaceMember` | Updates active member row; logs `member.profile.update` |
| `renameSpace` | `(spaceId, name)` | `Space` | Auth: user must be a member; logs `space.rename` |
| `leaveSpace` | `(spaceId)` | `void` | Removes `space_members` row; throws if last member; logs `space.leave` |

### Invite
| Action | Signature | Returns | Notes |
|---|---|---|---|
| `createInvite` | `()` | `{ code }` | Generates 8-char code; `expires_at = now() + 48h`; logs `invite.create` |
| `joinByInviteCode` | `(code)` | `{ spaceId }` | Validates code (not expired, not used); inserts `space_members`; marks `used_at`; throws `'Invalid code'` / `'Code expired'` / `'Already used'` / `'Already a member'` |

### Query (read-only)
| Action | Signature | Returns |
|---|---|---|
| `getItemDetail` | `(itemId)` | `{ item, allEntries, purchaseHistory } \| null` |
| `getCategoryDetail` | `(categoryId)` | `{ category, items, monthlySpend } \| null` |
| `getSpaceSpend` | `(from, to)` | spend totals + byCategory breakdown |
| `getRecentPurchases` | `(limit?)` | recent purchase entries with item + category names |
| `getSpaceMembers` | `()` | `Array<{ userId, username, memberId, displayName, avatar }>` |

---

<!-- AS-IS.CONTEXT -->
## 4. Context Providers

Provider tree (outermost → innermost): `SpaceProvider → OfflineProvider → UIProvider`

Mounted in: `src/app/app/ClientLayout.tsx`. `SpaceProvider` initialized server-side in `src/app/app/layout.tsx`.

### `SpaceContext`
File: `src/components/providers/SpaceContext.tsx`

```ts
interface SpaceContextValue {
  spaceId: string;
  memberId: number;
  displayName: string;
  avatar: string | null;
  members: Array<{ memberId: number; displayName: string; avatar: string | null }>;
  mySpaces: Array<{ id: string; name: string }>;
}
// Hook: useSpace() — throws outside SpaceProvider
// Provider: SpaceProvider({ initialValue, children }) — read-only, no setters
```

### `UIContext`
File: `src/components/providers/UIContext.tsx`

Three focused hooks, each with its own context:

```ts
// useLogSheet() — FAB / log entry sheet
{ isOpen, prefillItemId, prefillType, open(itemId?, type?), close() }

// useQuickLog() — quick log sheet from QuickLogStrip chips
{ isOpen, itemId, prefill: QuickLogPrefill | null, open(itemId, prefill), close() }

// useItemSheet() — edit/delete item sheets
{ isEditOpen, editTarget, editEntryCount, isDeleteOpen, deleteTarget, openEdit(item, entryCount?), openDelete(item), close() }

// UIProvider wraps all three — all consumers must be inside UIProvider
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
  lastAction: number; // epoch ms — bump as useEffect dep to re-render after sync
}
// Hook: useOffline()
```

Entry mutations queue to IDB via `addPendingMutation()` then call `SyncEngine.sync()` if online.
Item/category mutations call server actions directly — no offline queue.

---

<!-- AS-IS.COMPONENT -->
## 5. Key Component Interfaces

Only top-level data-boundary components. Presentational sub-components omitted.

### Stock screen
```ts
// src/components/stock/StockClient.tsx
interface Props {
  itemsByCategory: Array<{
    category: Category | null;
    items: Array<{ item: Item; lastEntry: Entry | null }>;
  }>;
}
// Uses useSpace() for memberId + members (partner detection)
// Uses useQuickLog() to open quick log sheet
// Renders: ActivityStrip, QuickLogStrip, LowStockRail, CategoryGroup
```

```ts
// src/components/stock/StockItemCard.tsx
interface Props {
  item: Item;
  lastEntry: Entry | null;
  onTap: () => void;
  partnerTag?: string; // e.g. "Alex·2h" — pre-computed by StockClient
}
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

### Settings
```ts
// src/app/app/settings/SettingsClient.tsx
interface Props {
  categories: Category[];
  stores: string[];
}
// Uses useSpace() for spaceId, memberId, displayName, members, mySpaces
// Features: profile edit (updateMemberProfile), invite (createInvite + copy link),
//   space switcher (switchSpace, shown when mySpaces.length > 1),
//   leave space, passkey enrollment, theme/language toggle, logout
```

### Entry sheets
```ts
// src/components/entry/QuickLogSheet.tsx
interface Props {
  isOpen: boolean; onClose: () => void;
  itemId: number | null;
  prefill: QuickLogPrefill | null;
}

// src/components/entry/LogEntrySheet.tsx
interface Props {
  isOpen: boolean; onClose: () => void;
  prefillItemId?: number;
  prefillType?: EntryType;
}

// src/components/entry/EditEntrySheet.tsx
interface Props {
  entry: Entry; isOpen: boolean; onClose: () => void;
  onDelete: (entry: Entry) => void;
}
```

### Item sheets / modals
```ts
// src/components/item/EditItemSheet.tsx
interface Props {
  item: Item; categories: Category[]; hasEntries?: boolean;
  isOpen: boolean; onClose: () => void;
  onDeleteClick: (item: Item) => void;
}

// src/components/item/DeleteItemModal.tsx
interface Props {
  item: Item; entryCount: number;
  onConfirm: () => void; onCancel: () => void;
}

// src/components/entry/DeleteEntryModal.tsx
interface Props {
  entry: Entry; itemName: string;
  onConfirm: () => void; onCancel: () => void;
}

// src/components/ui/BottomSheetContainer.tsx
interface Props {
  isOpen: boolean; onClose: () => void;
  testId?: string; children: ReactNode;
}
// Handles portal, backdrop, animation. Use for ALL bottom sheets — do not repeat the pattern.
```

---

<!-- AS-IS.AUTH -->
## 6. Auth Flow

- **Session**: JWT in httpOnly cookie. `getSession()` → `{ userId, username, activeSpaceId, activeMemberId } | null`
- **requireSession()**: Returns `{ userId, spaceId, memberId }` or throws `'Unauthorized'` / `'No active space'`
- **Login**: `POST /api/auth { action: 'login', username, password }` → sets cookie
- **Register**: `POST /api/auth { action: 'register', username, password }` → creates user + space ("My Home") + space_member + sets cookie with `activeSpaceId` + `activeMemberId`
- **Passkey**: WebAuthn enrollment in Settings (`registerPasskey()`). Login via `loginPasskey()`.
- **Logout**: `src/app/auth/actions.ts` → clears cookie → redirects `/login`

---

<!-- AS-IS.IDB -->
## 7. Offline / IndexedDB

File: `src/lib/idb.ts`

IDB store: `pending_mutations` — queue of `{ id: uuid, type: MutationType, payload, timestamp }`.

```ts
type MutationType = 'entry.add' | 'entry.update' | 'entry.delete';
```

`SyncEngine` (`src/lib/sync.ts`) drains the queue when online, calling the corresponding entry server action. On success the mutation is removed from IDB.

---

<!-- AS-IS.UTIL -->
## 8. Utilities

| File | What it exports |
|---|---|
| `src/lib/constants.ts` | `ENTRY_TYPE`, `EntryType`, `ROUTES`, `THRESHOLDS`, `DEFAULTS`, `UNIT_OPTIONS` — import from here, never hardcode |
| `src/lib/price.ts` | `calculatePriceStats(purchases)` → `{ avg, best, last, dealSignal }`, `compareStores(purchases)` → `Record<store, { avg, count }>` |
| `src/lib/stock.ts` | `stockStatus({ currentStock, lowStockThreshold })` → `'out' \| 'low' \| 'ok'` |
| `src/lib/queries.ts` | All raw Drizzle queries; consumed by server actions and page components |
| `src/lib/logger.ts` | `log.info(event, payload)`, `log.warn(...)`, `log.error(...)` — wraps Axiom + console |
| `src/lib/i18n.tsx` | `useTranslation()` hook + `t(key)` — EN and TH strings; all UI-visible strings must have keys here |
| `src/lib/i18n.test.ts` | No-missing-keys guard — asserts EN and TH have identical key sets |
| `src/components/ui/Autocomplete.tsx` | `ItemSuggestion` type + autocomplete component for item search |
| `src/lib/session.ts` | `getSession()`, `requireSession()`, `setSession()`, `clearSession()` |
