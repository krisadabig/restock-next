# Build Status — Redesign

> Source of truth for `/goal`. First `🔲` row is always the next task.
> Full plan: `.agent/redesign-plan.md`
> Mark `✅` before ending any session. Use `🚧` if partially done.

## Legend
- ✅ Done — implemented, tests pass, build clean
- 🔲 Todo — not yet started
- 🚧 In Progress — started but not finished

---

## NEXT UP

> The first `🔲` task below is always picked up by `/goal`.

---

## Sprint 1 — Foundation

| Status | Task | Key Files | Tests |
|---|---|---|---|
| ✅ | **S1.1 — Write new schema** | `src/lib/db/schema.ts` | TypeScript types compile clean |
| ✅ | **S1.2 — Generate & apply migration** | `drizzle/migrations/` | Migration runs on dev + test DB without error |
| ✅ | **S1.3 — Rewrite Drizzle query helpers** | `src/lib/queries.ts` | Build clean, no references to old table names |
| ✅ | **S1.0 — Update test helpers & factories** | `tests/helpers/factories.ts`, `tests/helpers/db.ts` | Unit: `makeSpace`, `makeSpaceMember` produce correct rows |

---

## Sprint 2 — Auth & Session

| Status | Task | Key Files | Tests |
|---|---|---|---|
| ✅ | **S2.1 — Update session shape** | `src/lib/session.ts`, `src/app/api/auth/route.ts` | Unit: session encodes/decodes `activeSpaceId` + `activeMemberId` |
| ✅ | **S2.2 — Space creation flow** | `src/app/app/actions.ts`, `src/app/api/auth/route.ts` | Integration: register → space + member created → session has activeSpaceId |
| ✅ | **S2.3 — Space switching** | `src/app/app/actions.ts` | Integration: switchSpace sets new activeSpaceId in session; throws if not a member |
| ✅ | **S2.4 — Member profile management** | `src/app/app/actions.ts` | Integration: updateMemberProfile updates display_name; auth guard throws for wrong space |

<details for "S2.2 — Space creation flow">

On register (`POST /api/auth { action: 'register' }`):
1. Create `users` row
2. Create `spaces` row (name = "My Home" default or from request)
3. Create `space_members` row with `display_name` = username
4. Set session `{ userId, activeSpaceId, activeMemberId }`

Standalone action `createSpace(name, displayName)`:
- Creates space + space_member for current user
- Returns `{ spaceId, memberId }`
- Logs `space.create`

**TDD (RED→GREEN)**:
- Integration: register → DB has space row + space_members row → session cookie decodes with activeSpaceId
- Unit: `createSpace` throws 'Unauthorized' when no session
- Run: `bun run test:integration` → RED → implement → GREEN

</details>

<details for "S2.3 — Space switching">

`switchSpace(spaceId)`:
- Validates `space_members` row exists for (spaceId, userId)
- Updates session cookie with new `activeSpaceId` + `activeMemberId`
- Calls `revalidatePath('/app')`
- Throws `'Not a member'` if user doesn't belong to that space
- Logs `space.switch`

`getMySpaces()`:
- Returns all spaces the current user belongs to (via space_members)
- Includes display_name for each membership

**TDD (RED→GREEN)**:
- Integration: user in 2 spaces → switchSpace(space2Id) → getSession() returns space2Id
- Integration: switchSpace with foreign spaceId → throws 'Not a member'
- Run: `bun run test:integration` → RED → implement → GREEN

</details>

<details for "S2.4 — Member profile management">

`updateMemberProfile({ displayName, avatar? })`:
- Updates `space_members` row for current `activeMemberId`
- Validates the memberId belongs to the session's activeSpaceId (auth guard)
- Logs `member.profile.update`

**TDD (RED→GREEN)**:
- Integration: updateMemberProfile → space_members row has new display_name
- Unit: throws 'Unauthorized' when no session
- Run: `bun run test:integration` → RED → implement → GREEN

</details>

---

## Sprint 3 — Server Actions

| Status | Task | Key Files | Tests |
|---|---|---|---|
| ✅ | **S3.1 — Update requireSession()** | `src/lib/session.ts` | Unit: returns spaceId+memberId; throws on no session; throws on no active space |
| ✅ | **S3.2 — Category actions** | `src/app/app/actions.ts` | Integration: CRUD + auth guard (wrong spaceId throws) |
| ✅ | **S3.3 — Item actions** | `src/app/app/actions.ts` | Integration: CRUD + auth guard + getSpaceItems returns correct shape |
| ✅ | **S3.4 — Entry actions** | `src/app/app/actions.ts` | Integration: add/update/delete recalculates currentStock; memberId attribution |
| ✅ | **S3.5 — Space actions** | `src/app/app/actions.ts` | Integration: getMySpaces, renameSpace, leaveSpace |
| ✅ | **S3.6 — Invite actions** | `src/app/app/actions.ts` | Integration: createInvite → joinByInviteCode happy path; expired/used/duplicate errors |
| 🔲 | **S3.7 — Authorization tests** | `src/app/app/actions.test.ts` | Unit: every ID-accepting action throws when spaceId doesn't own the record |

<details for "S3.1 — Update requireSession()">

```ts
async function requireSession(): Promise<{ userId: string; spaceId: string; memberId: number }> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  if (!session.activeSpaceId) throw new Error('No active space');
  return { userId: session.userId, spaceId: session.activeSpaceId, memberId: session.activeMemberId };
}
```

**TDD (RED→GREEN)**:
- Unit: mock getSession() → null → throws 'Unauthorized'
- Unit: mock getSession() → no activeSpaceId → throws 'No active space'
- Unit: mock getSession() → full session → returns { userId, spaceId, memberId }
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "S3.2 — Category actions">

`addCategory({ name, defaultUnit? })` → scoped to spaceId
`getCategories()` → space-scoped list
`updateCategory(id, { name?, defaultUnit? })` → auth guard
`deleteCategory(id)` → auth guard

Auth guard pattern: fetch record, compare `record.spaceId !== spaceId` → throw 'Not found'
Log events: `category.add`, `category.update`, `category.delete`

**TDD (RED→GREEN)**:
- Integration: addCategory → row in DB with correct spaceId
- Integration: updateCategory with foreign spaceId → throws 'Not found'
- Run: `bun run test:integration` → RED → implement → GREEN

</details>

<details for "S3.3 — Item actions">

`addItem({ name, unit?, categoryId? })` → scoped to spaceId
`updateItem(id, patch)` → auth guard
`deleteItem(id)` → auth guard, cascade entries
`getSpaceItems()` → returns `Array<{ item, category, lastEntry, lastMember: { displayName } }>`
`getItemsForAutocomplete()` → ordered by lastEntryAt DESC

Log events: `item.add`, `item.update`, `item.delete`

**TDD (RED→GREEN)**:
- Integration: addItem → DB row with spaceId
- Integration: getSpaceItems → includes lastMember.displayName from space_members
- Integration: deleteItem with foreign spaceId → throws 'Not found'
- Run: `bun run test:integration` → RED → implement → GREEN

</details>

<details for "S3.4 — Entry actions">

`addEntry({ itemId, type, price?, quantity, unit, store?, date, note? })`
- Uses `memberId` from requireSession() for attribution
- Atomically updates `item.current_stock` in same transaction
- Strips price+store when type='consume'

`updateEntry(id, patch)` → recalculates stock delta
`deleteEntry(id)` → reverses stock delta

Log events: `entry.add`, `entry.update`, `entry.delete`

**TDD (RED→GREEN)**:
- Integration: addEntry purchase → item.currentStock increases by quantity
- Integration: addEntry consume → item.currentStock decreases
- Integration: deleteEntry purchase → item.currentStock decreases back
- Integration: updateEntry changes quantity → stock recalculated correctly
- Integration: addEntry with foreign itemId → throws 'Not found'
- Run: `bun run test:integration` → RED → implement → GREEN

</details>

<details for "S3.5 — Space actions">

`getMySpaces()` → `Array<{ id, name, displayName, memberCount }>`
`renameSpace(id, name)` → auth: user must be a member
`leaveSpace(id)` → removes space_members row; throws if last member (or delete space)

Log events: `space.rename`, `space.leave`

**TDD (RED→GREEN)**:
- Integration: getMySpaces → returns all spaces current user is a member of
- Integration: renameSpace with foreign spaceId → throws 'Not a member'
- Integration: leaveSpace → space_members row deleted
- Run: `bun run test:integration` → RED → implement → GREEN

</details>

<details for "S3.6 — Invite actions">

`createInvite()` → generates 8-char alphanumeric code, inserts `space_invites` with `expires_at = now() + 48h`, returns `{ code }`
`joinByInviteCode(code)` → find invite (not expired, not used) → insert space_members with display_name = username → mark `used_at` → return spaceId
Throws: `'Invalid code'`, `'Code expired'`, `'Already used'`, `'Already a member'`

Log events: `invite.create`, `invite.join`, `invite.join.failed`

**TDD (RED→GREEN)**:
- Integration: createInvite → row in space_invites with 8-char code
- Integration: joinByInviteCode happy path → space_members row created
- Integration: joinByInviteCode with expired invite → throws 'Code expired'
- Integration: joinByInviteCode twice → throws 'Already used'
- Integration: joinByInviteCode already a member → throws 'Already a member'
- Run: `bun run test:integration` → RED → implement → GREEN

</details>

<details for "S3.7 — Authorization tests">

Unit tests using `vi.hoisted` + mock `@/lib/session` + mock `@/lib/db` pattern.
Every action that accepts a record ID must assert it throws when session spaceId does not own that record.

Actions to cover: `updateItem`, `deleteItem`, `updateEntry`, `deleteEntry`, `updateCategory`, `deleteCategory`, `renameSpace`, `joinByInviteCode` (used invite).

**TDD (RED→GREEN)**:
- Write all tests first → RED (actions not yet checking ownership correctly or mocks not set up)
- Implement auth guards in actions → GREEN
- Run: `bun run test:unit` → all pass

</details>

---

## Sprint 4 — Context & Architecture

| Status | Task | Key Files | Tests |
|---|---|---|---|
| 🔲 | **S4.1 — SpaceContext provider** | `src/components/providers/SpaceContext.tsx` | Unit: useSpace() returns correct shape; throws outside provider |
| 🔲 | **S4.2 — UIContext refactor** | `src/components/providers/` | Unit: each hook manages its own open/close state independently |
| 🔲 | **S4.3 — Simplify offline layer** | `src/components/providers/OfflineContext.tsx`, `src/lib/sync.ts` | Unit: only entry mutations queued to IDB; others call server directly |

<details for "S4.1 — SpaceContext provider">

```ts
interface SpaceContextValue {
  spaceId: string;
  memberId: number;
  displayName: string;
  avatar: string | null;
  members: Array<{ memberId: number; displayName: string; avatar: string | null }>;
  mySpaces: Array<{ id: string; name: string }>;
}
```

Initialized server-side in `app/app/layout.tsx` → passed to `<SpaceProvider initialValue={...}>`.
Hook: `useSpace()` — throws if used outside provider.
Remove `HouseholdContext` and `useHousehold()` entirely.

**TDD (RED→GREEN)**:
- Unit: render component using useSpace() outside provider → throws
- Unit: render with SpaceProvider → useSpace() returns expected shape
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "S4.2 — UIContext refactor">

Split UIContext into 3 focused hooks/contexts:

`useLogSheet` — `{ isOpen, prefillItemId, prefillType, open(itemId?, type?), close() }`
`useQuickLog` — `{ isOpen, itemId, prefill, open(itemId, prefill), close() }`
`useItemSheet` — `{ isEditOpen, editTarget, isDeleteOpen, deleteTarget, openEdit(item), openDelete(item), close() }`

Remove: `isAddModalOpen` legacy alias, `editItemEntryCount` from context (pass directly to modal).
Update all consumers.

**TDD (RED→GREEN)**:
- Unit: useLogSheet — open() sets isOpen true + prefill; close() resets
- Unit: useQuickLog — open() with itemId → itemId stored; close() clears
- Unit: useItemSheet — openEdit and openDelete are independent
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "S4.3 — Simplify offline layer">

Keep offline queue ONLY for: `entry.add`, `entry.update`, `entry.delete`.
Remove from OfflineContext: `addItemOffline`, `updateItemOffline`, `deleteItemOffline`, `addCategoryOffline`.
Update `SyncEngine` to only process entry mutation types.
Update `MutationType` in `src/lib/idb.ts`.

**TDD (RED→GREEN)**:
- Unit: addEntryOffline when offline → mutation queued in IDB
- Unit: updateItemOffline no longer exists (compile error if referenced)
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

---

## Sprint 5 — UI Screens

| Status | Task | Key Files | Tests |
|---|---|---|---|
| 🔲 | **S5.1 — App layout & space switcher UI** | `src/app/app/layout.tsx` | Unit: SpaceContext initialized with correct data from session |
| 🔲 | **S5.2 — Stock screen update** | `src/components/stock/StockClient.tsx` | Unit: partner tag uses display_name; group filter chip removed |
| 🔲 | **S5.3 — Log entry & quick log sheets** | `src/components/entry/` | Unit: attribution uses memberId; confirm-wiring tests |
| 🔲 | **S5.4 — Settings screen redesign** | `src/app/app/settings/SettingsClient.tsx` | Unit: invite flow shown; profile edit calls updateMemberProfile |
| 🔲 | **S5.5 — Price & category screens** | `src/components/price/`, `src/components/category/` | Build clean; no household references |
| 🔲 | **S5.6 — Remove deprecated routes & dead code** | `src/app/app/inventory/`, `src/app/app/trends/` | Build clean; no 404 routes remain |

<details for "S5.1 — App layout & space switcher UI">

`app/app/layout.tsx` — server component:
1. Call `requireSession()` → get { spaceId, memberId }
2. Fetch space data: space name, members (display_name, avatar), mySpaces list
3. Pass all to `<SpaceProvider initialValue={...}>`

Add space name + switcher somewhere visible (Settings header or nav). Tapping a space in the list calls `switchSpace(spaceId)`.

**TDD (RED→GREEN)**:
- Unit: layout passes correct initialValue to SpaceProvider based on mocked session + DB
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "S5.2 — Stock screen update">

- Replace `useHousehold()` → `useSpace()`
- `partnerActivityItems`: derived from entries where `memberId !== activeMemberId` (not `userId !== currentUserId`)
- `partnerTag` on item cards: uses `space_members.display_name` not `users.username`
- Remove group filter chip strip (groups concept dropped)
- `StockClient` props: remove `groups` prop

**TDD (RED→GREEN)**:
- Unit: StockClient — partner tag shows display_name when last entry is from other member
- Unit: StockClient — no group-filter-strip rendered
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "S5.3 — Log entry & quick log sheets">

- `LogEntrySheet` / `QuickLogSheet`: pass `memberId` (from `useSpace()`) to `addEntry()`
- Switch from `useUI()` → `useLogSheet()` / `useQuickLog()`
- Confirm-wiring test: Save button fires `addEntryOffline` with correct memberId

**TDD (RED→GREEN)**:
- Unit: QuickLogSheet Save → addEntryOffline called with memberId from context
- Unit: LogEntrySheet consume mode → price+store hidden, addEntryOffline called with type='consume'
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "S5.4 — Settings screen redesign">

Replace Household section with Space section:
- Space name (editable via renameSpace)
- My profile: display_name + avatar (editable via updateMemberProfile)
- Members list: all space_members with display_name
- Invite: "Invite member" button → createInvite() → show code + copy link `/join/<code>`
- Danger zone: Leave this space

Also: switch space / create new space links.

**TDD (RED→GREEN)**:
- Unit: "Invite member" tap → createInvite() called → code displayed
- Unit: profile save → updateMemberProfile() called with new displayName
- Unit: leave space → leaveSpace() called with confirm dialog
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "S5.5 — Price & category screens">

Minor updates:
- `PriceClient` props: `spaceId` instead of `householdId` (or remove from props entirely if fetched server-side)
- `CategoryClient`: same
- Page data fetching: use `getSpaceSpend()`, `getSpaceItems()` etc.

**TDD**: `bun run build` clean + `bun run test:unit` pass (no new tests needed for rename-only changes).

</details>

<details for "S5.6 — Remove deprecated routes & dead code">

Delete:
- `src/app/app/inventory/` (redirect route)
- `src/app/app/trends/` (redirect route)
- `isAddModalOpen` alias from wherever it still lives
- All `householdId` / `household_id` prop names in components

**TDD**: `bun run build` clean. `bun run test:unit` pass. No 404-redirect routes remain.

</details>

---

## Sprint 6 — Quality & Docs

| Status | Task | Key Files | Tests |
|---|---|---|---|
| 🔲 | **S6.1 — Integration tests** | `tests/integration/spaces.test.ts` | Integration: full happy paths for spaces + invites |
| 🔲 | **S6.2 — i18n update** | `src/lib/i18n.tsx`, `src/lib/i18n.test.ts` | Unit: no-missing-keys guard passes with new keys |
| 🔲 | **S6.3 — Update agent docs** | `.agent/as-is.md`, `.agent/data-model-spec.md`, `.agent/ux-spec.md` | Docs reflect new schema, actions, context |
