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
| 🔲 | U1.1 | **Add error boundary for /app** | `src/app/app/error.tsx` |
| 🔲 | U1.2 | **Remove dead "Forgot?" button** | `src/app/login/page.tsx` |
| 🔲 | U1.3 | **Fix login page copy** | `src/app/login/page.tsx` |
| 🔲 | B1.1 | **Space switcher UI** | `src/app/app/AppShell.tsx` |
| 🔲 | B1.2 | **Create new space flow** | `src/app/app/settings/SettingsClient.tsx` |
| 🔲 | B1.3 | **Join space flow** | `src/app/join/[code]/page.tsx` |
| 🔲 | T1.3 | **Add skip-to-content link** | `src/app/layout.tsx` |
| 🔲 | T1.4 | **Add og:image metadata** | `src/app/layout.tsx` |
| 🔲 | T1.5 | **Custom 404 page** | `src/app/not-found.tsx` |
| 🔲 | T1.6 | **Tabular nums on stock quantity** | `src/components/stock/StockItemCard.tsx` |
| 🔲 | T1.7 | **text-wrap: balance on headlines** | `src/app/globals.css` |
| 🔲 | U1.4 | **New user onboarding hint** | `src/components/stock/StockClient.tsx` |
| 🔲 | U1.5 | **Fix passkey detection copy** | `src/app/login/page.tsx` |
| 🔲 | U1.6 | **Avatar upload** | `src/app/app/settings/SettingsClient.tsx` |

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

Add "Create new space" entry point in Settings. Tapping opens an inline form: input for space name → submit calls `createSpace(name, displayName)` → switches to the new space.

**Available action**: `createSpace(name, displayName)` exists in `actions.ts`.

**TDD (RED→GREEN)**:
- Unit: submit form → createSpace called with correct name + displayName
- Unit: empty name → form does not submit
- i18n: add `settings.createSpace`, `settings.createSpacePlaceholder`, `settings.createSpaceSuccess` keys (EN + TH)
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "B1.3 — Join space flow">

New public route `/join/[code]` — redirect to login if no session, then back.

Page: "You've been invited to join a space." + Accept button → `joinByInviteCode(code)` → redirect to `/app`.

Error states: invalid code, expired, already used, already a member — inline message, no crash.

**Available action**: `joinByInviteCode(code)` exists in `actions.ts`.

**TDD (RED→GREEN)**:
- Unit: valid code → joinByInviteCode called → redirect to /app
- Unit: expired code → error message shown, no redirect
- Unit: already a member → error message shown
- i18n: add `join.title`, `join.accept`, `join.invalid`, `join.expired`, `join.alreadyMember` keys (EN + TH)
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

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
