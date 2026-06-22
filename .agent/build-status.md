# Build Status — Redesign

> Source of truth for `/goal`. First `🔲` row is always the next task.
> Full plan: `.agent/redesign-plan.md`
> Mark `✅` before ending any session. Use `🚧` if partially done.

## Legend
- ✅ Done — implemented, tests pass, build clean
- 🔲 Todo — not yet started
- 🚧 In Progress — started but not finished

---

## NEXT UP — Ordered Queue

> `/goal` picks the first `🔲` row. Work top-to-bottom.

| Status | ID | Task | Key Files |
|---|---|---|---|
| ✅ | T1.2 | **Define or remove bg-blob** | `src/app/app/AppShell.tsx` | build clean · 2026-06-22 |
| ✅ | U1.1 | **Add error boundary for /app** | `src/app/app/error.tsx` | 2 tests pass · build clean · 2026-06-22 |
| ✅ | U1.2 | **Remove dead "Forgot?" button** | `src/app/login/page.tsx` | build clean · 2026-06-22 |
| ✅ | U1.3 | **Fix login page copy** | `src/app/login/page.tsx` | build clean · 2026-06-22 |
| ✅ | B1.1 | **Space switcher UI** | `src/app/app/AppShell.tsx` | 4 tests pass · build clean · 2026-06-22 |
| ✅ | B1.2 | **Create new space flow** | `src/app/app/settings/SettingsClient.tsx` | 2 tests pass · build clean · 2026-06-22 |
| ✅ | B1.3 | **Join space flow** | `src/app/join/[code]/page.tsx` | 6 tests pass · build clean · 2026-06-22 |
| 🔲 | T1.3 | **Add skip-to-content link** | `src/app/layout.tsx` |
| 🔲 | T1.5 | **Custom 404 page** | `src/app/not-found.tsx` |
| 🔲 | T1.6 | **Tabular nums on stock quantity** | `src/components/stock/StockItemCard.tsx` |
| 🔲 | T1.7 | **text-wrap: balance on headlines** | `src/app/globals.css` |
| 🔲 | U1.4 | **New user onboarding hint** | `src/components/stock/StockClient.tsx` |
| 🔲 | U1.5 | **Fix passkey detection copy** | `src/app/app/settings/SettingsClient.tsx` |

---

## Story specs

<details for "T1.2 — Define or remove bg-blob">

`bg-blob` is referenced in `AppShell.tsx` as `className="bg-blob bg-primary/5 -top-50 -left-50"` but is not defined in `globals.css`. Either define it as a `@utility` or remove the element entirely.

**TDD**: `bun run build` clean. No new tests — purely CSS.

</details>

<details for "U1.1 — Add error boundary for /app">

Create `src/app/app/error.tsx` using Next.js error boundary convention. Shows a friendly recovery UI when any server action in `/app/**` throws unexpectedly. Must have a "Try again" button that calls `reset()`.

**TDD (RED→GREEN)**:
- Unit: render error boundary with an error → "Try again" button present
- i18n: add `error.title`, `error.retry` keys (EN + TH)
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "U1.2 — Remove dead Forgot? button">

`src/app/login/page.tsx` has a `<button type="button">Forgot?</button>` with no handler. No password reset flow exists. Remove the button entirely — dead UI erodes trust.

**TDD**: `bun run build` clean. No new tests.

</details>

<details for "U1.3 — Fix login page copy">

Replace corporate/security-theatre copy with warm, direct language:
- "Secure Portal" → remove or replace with nothing / "Welcome back"
- "Integrated Security Protocol" → remove
- "Version 2.0.4-premium" → remove entirely (fake version, doesn't match package.json)

Tone target: same warmth as the rest of the app. Short, confident, no buzzwords.

**TDD**: `bun run build` clean. No new tests.

</details>

<details for "B1.1 — Space switcher UI">

Show active space name in the app header/nav. Tapping opens a sheet listing all spaces from `useSpace().mySpaces`. Tapping a space calls `switchSpace(spaceId)` then closes the sheet.

**Available actions**: `switchSpace(spaceId)`, `getMySpaces()` — both exist in `actions.ts`.
**Context**: `useSpace()` exposes `mySpaces: Array<{ id, name }>` and `spaceId` (active).

UI placement: AppShell header. Keep it minimal — space name + chevron, sheet on tap.

**TDD (RED→GREEN)**:
- Unit: render SpaceSwitcher with 2 spaces → tap second → switchSpace called with correct id
- Unit: active space is visually marked (aria-current or data-active)
- i18n: no new strings needed (space names are user data)
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "B1.2 — Create new space flow">

Add "Create new space" entry point in Settings. Tapping opens an inline form with two fields:
1. **Space name** (required) — free text, e.g. "Holiday Home"
2. **Your display name in this space** (optional) — pre-filled with the user's current `displayName` from `useSpace()`; user can change it before submitting

Submit calls `createSpace(name, displayName)` → then calls `switchSpace(newSpaceId)` → then `router.refresh()` to land in the new space. Show a brief success state before the refresh.

**Available action**: `createSpace(name, displayName)` exists in `actions.ts`. Returns `{ spaceId, memberId }`.

**Decision**: `displayName` defaults to the user's current profile name. The second input is optional — if left unchanged, the current name is used.

**TDD (RED→GREEN)**:
- Unit: submit form with name + displayName → `createSpace` called with correct args, then `switchSpace` called with returned spaceId
- Unit: empty space name → form does not submit (button disabled)
- i18n: add `settings.createSpace`, `settings.createSpacePlaceholder`, `settings.yourNameInSpace`, `settings.createSpaceSuccess` keys (EN + TH)
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "B1.3 — Join space flow">

New public route `/join/[code]` (server component). If no session, redirect to `/login?returnUrl=/join/[code]`. The login page already redirects to the `returnUrl` after login.

Page content: space invite card — "You've been invited to join a space." + Accept button. No space name shown (not exposed before joining).

Accept button → calls `joinByInviteCode(code)` server action → on success redirect to `/app`.

Error states shown inline (no crash, no redirect):
- `'Invalid code'` → `join.invalid`
- `'Code expired'` → `join.expired`
- `'Already used'` → `join.invalid` (same copy is fine)
- `'Already a member'` → `join.alreadyMember`

**Available action**: `joinByInviteCode(code)` exists in `actions.ts`. Throws one of the strings above on failure.

**Decision**: Login redirect uses `?returnUrl=/join/[code]` query param. Verify `src/app/login/page.tsx` already reads `returnUrl` and redirects after login — if not, add it as part of this story.

**TDD (RED→GREEN)**:
- Unit: render page with valid code → Accept button present → click → `joinByInviteCode` called → redirect to `/app`
- Unit: `joinByInviteCode` throws `'Code expired'` → `join.expired` message shown, no redirect
- Unit: throws `'Already a member'` → `join.alreadyMember` message shown
- i18n: add `join.title`, `join.accept`, `join.invalid`, `join.expired`, `join.alreadyMember` keys (EN + TH)
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "T1.3 — Add skip-to-content link">

Add a visually-hidden skip link as the very first element inside `<body>` in `src/app/layout.tsx`. It becomes visible on focus (keyboard nav). Target: `#main-content`.

Add `id="main-content"` to the `<main>` element (or equivalent wrapper) in the app layout.

**TDD**: `bun run build` clean. No new unit tests — purely HTML/CSS.
i18n: add `a11y.skipToContent` key (EN: "Skip to content" · TH: "ข้ามไปยังเนื้อหา").

</details>

<details for "T1.5 — Custom 404 page">

Create `src/app/not-found.tsx`. Shows a friendly "Page not found" screen matching the app's glass/dark aesthetic.

Content:
- Heading: "Page not found" (`notFound.title`)
- Body: "This page doesn't exist or has been moved." (`notFound.body`)
- Button: "Go home" → links to `/` (`notFound.home`)

No auth required — this page is public.

**TDD**: `bun run build` clean. No new unit tests — static render.
i18n: add `notFound.title`, `notFound.body`, `notFound.home` keys (EN + TH).

</details>

<details for "T1.6 — Tabular nums on stock quantity">

In `src/components/stock/StockItemCard.tsx`, add `tabular-nums` (Tailwind: `font-variant-numeric: tabular-nums`) to the element that renders the stock quantity number. This prevents layout shift when numbers change width (e.g. "9" → "10").

**TDD**: `bun run build` clean. No new unit tests — CSS-only change.

</details>

<details for "T1.7 — text-wrap: balance on headlines">

In `src/app/globals.css`, add a global rule:

```css
h1, h2, h3 {
  text-wrap: balance;
}
```

This prevents awkward single-word orphans on wrapped headings across all screens.

**TDD**: `bun run build` clean. No new unit tests — CSS-only change.

</details>

<details for "U1.4 — New user onboarding hint">

In `src/components/stock/StockClient.tsx`, when `itemsByCategory` is empty (zero items), replace the generic empty state with a first-use hint card:

Content:
- Heading: "Welcome to Restock" (`onboarding.title`)
- Body: "Tap + to log your first item and start tracking prices." (`onboarding.hint`)

The hint card sits where the item list would be. No dismiss button — it disappears naturally once the first item is logged.

**TDD (RED→GREEN)**:
- Unit: render `StockClient` with empty `itemsByCategory` → `onboarding.hint` text visible
- Unit: render with one item → hint not rendered
- i18n: add `onboarding.title`, `onboarding.hint` keys (EN + TH)
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "U1.5 — Fix passkey detection copy">

In `src/app/app/settings/SettingsClient.tsx`, the passkey section currently shows:
> "Secure your account with FaceID or TouchID."

This is Apple-only. Replace with:
> "Secure your account with a passkey (Face ID, fingerprint, or PIN)."

i18n key: `settings.passkeyDesc` — add EN + TH. Replace the hardcoded string with `t('settings.passkeyDesc')`.

**TDD**: `bun run build` clean. No new unit tests — string change only.

</details>

---

## Backlog — Deferred

> Not in the active queue. Pick up when ready.

| ID | Task | Key Files | Notes |
|---|---|---|---|
| T1.4 | **Add og:image metadata** | `src/app/layout.tsx` | Need an og:image asset first |
| U1.6 | **Avatar upload** | `src/app/app/settings/SettingsClient.tsx` | Requires Supabase Storage setup |

---

## History — Completed

### Sprints 1–6 — Redesign ✅

| Sprint | Stories |
|---|---|
| S1 Foundation | schema, migration, query helpers, test factories |
| S2 Auth & Session | session shape, space creation, switching, member profiles |
| S3 Server Actions | requireSession, category/item/entry/space/invite CRUD + auth tests |
| S4 Context & Architecture | SpaceContext, UIContext split, offline layer simplified |
| S5 UI Screens | layout, stock, log sheets, settings, price/category, dead code removed |
| S6 Quality & Docs | integration tests, i18n, agent docs |

### Taste Audit ✅ (partial)

| ID | Task | Verified |
|---|---|---|
| T0.1 | Sync as-is.md to current reality | docs only · 2026-06-22 |
| T1.1 | Fix duplicate --muted CSS | build clean · 2026-06-22 |

### UX Revamp ✅

| Task | Notes |
|---|---|
| B2.1 Unit selection redesign | Replaced PillSelector with `<select>` |
| B2.2 Full UX audit + fixes | QuickLogSheet bug, chip styles, switchSpace wired, invite copy-link |
