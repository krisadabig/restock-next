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

## Sprint 1 — Foundation ✅

| Status | Task | Key Files |
|---|---|---|
| ✅ | S1.1 — Write new schema | `src/lib/db/schema.ts` |
| ✅ | S1.2 — Generate & apply migration | `drizzle/migrations/` |
| ✅ | S1.3 — Rewrite Drizzle query helpers | `src/lib/queries.ts` |
| ✅ | S1.0 — Update test helpers & factories | `tests/helpers/` |

## Sprint 2 — Auth & Session ✅

| Status | Task | Key Files |
|---|---|---|
| ✅ | S2.1 — Update session shape | `src/lib/session.ts` |
| ✅ | S2.2 — Space creation flow | `src/app/app/actions.ts`, `src/app/api/auth/route.ts` |
| ✅ | S2.3 — Space switching | `src/app/app/actions.ts` |
| ✅ | S2.4 — Member profile management | `src/app/app/actions.ts` |

## Sprint 3 — Server Actions ✅

| Status | Task | Key Files |
|---|---|---|
| ✅ | S3.1 — Update requireSession() | `src/lib/session.ts` |
| ✅ | S3.2 — Category actions | `src/app/app/actions.ts` |
| ✅ | S3.3 — Item actions | `src/app/app/actions.ts` |
| ✅ | S3.4 — Entry actions | `src/app/app/actions.ts` |
| ✅ | S3.5 — Space actions | `src/app/app/actions.ts` |
| ✅ | S3.6 — Invite actions | `src/app/app/actions.ts` |
| ✅ | S3.7 — Authorization tests | `src/app/app/actions.test.ts` |

## Sprint 4 — Context & Architecture ✅

| Status | Task | Key Files |
|---|---|---|
| ✅ | S4.1 — SpaceContext provider | `src/components/providers/SpaceContext.tsx` |
| ✅ | S4.2 — UIContext refactor | `src/components/providers/` |
| ✅ | S4.3 — Simplify offline layer | `src/components/providers/OfflineContext.tsx` |

## Sprint 5 — UI Screens ✅

| Status | Task | Key Files |
|---|---|---|
| ✅ | S5.1 — App layout & space switcher UI | `src/app/app/layout.tsx` |
| ✅ | S5.2 — Stock screen update | `src/components/stock/StockClient.tsx` |
| ✅ | S5.3 — Log entry & quick log sheets | `src/components/entry/` |
| ✅ | S5.4 — Settings screen redesign | `src/app/app/settings/SettingsClient.tsx` |
| ✅ | S5.5 — Price & category screens | `src/components/price/`, `src/components/category/` |
| ✅ | S5.6 — Remove deprecated routes & dead code | `src/app/app/inventory/`, `src/app/app/trends/` |

## Sprint 6 — Quality & Docs ✅

| Status | Task | Key Files |
|---|---|---|
| ✅ | S6.1 — Integration tests | `tests/integration/spaces.test.ts` |
| ✅ | S6.2 — i18n update | `src/lib/i18n.tsx` |
| ✅ | S6.3 — Update agent docs | `.agent/as-is.md` |

---

## Sprint 7 — Space Management UX

> Actions exist. UI does not. All three stories are UI-only.

| Status | Task | Key Files | Tests |
|---|---|---|---|
| 🔲 | **B1.1 — Space switcher UI** | `src/app/app/AppShell.tsx`, `src/components/providers/SpaceContext.tsx` | Unit: tapping a space calls switchSpace; active space highlighted |
| 🔲 | **B1.2 — Create new space flow** | `src/app/app/settings/SettingsClient.tsx` | Unit: form submit calls createSpace; new space appears in switcher |
| 🔲 | **B1.3 — Join space flow** | `src/app/join/[code]/page.tsx` | Unit: valid code calls joinByInviteCode; invalid shows error |

<details for "B1.1 — Space switcher UI">

Show active space name in the app header/nav. Tapping opens a sheet listing all spaces from `useSpace().mySpaces`. Tapping a space calls `switchSpace(spaceId)` then closes the sheet.

**Available actions**: `switchSpace(spaceId)`, `getMySpaces()` — both exist in `actions.ts`.
**Context**: `useSpace()` exposes `mySpaces: Array<{ id, name }>` and `spaceId` (active).

UI placement: AppShell header, next to the existing nav items. Keep it minimal — space name + chevron, sheet on tap.

**TDD (RED→GREEN)**:
- Unit: render SpaceSwitcher with 2 spaces → tap second → switchSpace called with correct id
- Unit: active space is visually marked (aria-current or data-active)
- i18n: no new strings needed (space names are user data)
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "B1.2 — Create new space flow">

Add "Create new space" entry point in Settings (below the space switcher or in a dedicated section). Tapping opens an inline form or sheet: input for space name → submit calls `createSpace(name, displayName)` → switches to the new space.

**Available action**: `createSpace(name, displayName)` exists in `actions.ts`.

**TDD (RED→GREEN)**:
- Unit: submit form → createSpace called with correct name + displayName
- Unit: empty name → form does not submit
- i18n: add `settings.createSpace`, `settings.createSpacePlaceholder`, `settings.createSpaceSuccess` keys (EN + TH)
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

<details for "B1.3 — Join space flow">

New public route `/join/[code]` — accessible without auth (redirect to login if no session, then back).

Page: show "You've been invited to join a space." + "Accept" button → calls `joinByInviteCode(code)` → redirects to `/app`.

Error states: invalid code, expired, already used, already a member — show inline message, no crash.

**Available action**: `joinByInviteCode(code)` exists in `actions.ts`.

**TDD (RED→GREEN)**:
- Unit: valid code → joinByInviteCode called → redirect to /app
- Unit: expired code → error message shown, no redirect
- Unit: already a member → error message shown
- i18n: add `join.title`, `join.accept`, `join.invalid`, `join.expired`, `join.alreadyMember` keys (EN + TH)
- Run: `bun run test:unit` → RED → implement → GREEN

</details>

---

## Backlog — Taste Audit Fixes

> Findings from design audit. Bugs first, then accessibility, then polish.

| Status | Task | Key Files | Notes |
|---|---|---|---|
| 🔲 | **T0.1 — Sync as-is.md to current reality** | `.agent/as-is.md` | Content stale (still has `household`, `HouseholdContext`, `groups`). Update §1–5 to reflect actual code. No tests — verify via grep for `household` returning zero hits. |
| 🔲 | **T1.1 — Fix duplicate --muted CSS** | `src/app/globals.css` | `--muted` defined twice in both `:root` and `.dark` — remove duplicates |
| 🔲 | **T1.2 — Define or remove bg-blob** | `src/app/globals.css`, `src/app/app/AppShell.tsx` | Used in AppShell but undefined — define the utility or remove usage |
| 🔲 | **T1.3 — Add skip-to-content link** | `src/app/layout.tsx` | Hidden skip link for keyboard accessibility (WCAG requirement) |
| 🔲 | **T1.4 — Add og:image metadata** | `src/app/layout.tsx` | Add `openGraph.images` for social sharing previews |
| 🔲 | **T1.5 — Custom 404 page** | `src/app/not-found.tsx` | Branded "page not found" using glass design system |
| 🔲 | **T1.6 — Tabular nums on stock quantity** | `src/components/stock/StockItemCard.tsx` | `font-variant-numeric: tabular-nums` prevents layout jitter on number updates |
| 🔲 | **T1.7 — text-wrap: balance on headlines** | `src/app/globals.css` | Prevent orphaned words on modal titles and section headers |

---

## Backlog — UX Polish

> Production-readiness UX issues found in audit. Priority order matches ship order.

| Status | Task | Key Files | Notes |
|---|---|---|---|
| 🔲 | **U1.1 — Add error boundary for /app** | `src/app/app/error.tsx` | Missing — unexpected server action throws crash the whole app with no recovery. Use Next.js `error.tsx` convention. |
| 🔲 | **U1.2 — Remove dead "Forgot?" button** | `src/app/login/page.tsx` | Button has no handler. Remove or wire to a "contact admin" message since there's no reset flow. |
| 🔲 | **U1.3 — Fix login page copy** | `src/app/login/page.tsx` | "Secure Portal", "Integrated Security Protocol", "Version 2.0.4-premium" clash with the warm domestic tone of the rest of the app. Replace with plain, friendly copy. |
| 🔲 | **U1.4 — New user onboarding hint** | `src/components/stock/StockClient.tsx` | Empty state is passive ("Tap + to add your first item"). First-time users don't know what a space is or how to invite someone. Upgrade empty state: add a short "what to do next" hint with links to invite and add first item. |
| 🔲 | **U1.5 — Fix passkey detection copy** | `src/app/login/page.tsx` | "Biometric security detected." always shows regardless of device support. Show this only after feature detection, or remove the claim entirely. |
| 🔲 | **U1.6 — Avatar upload** | `src/app/app/settings/SettingsClient.tsx` | `avatar` column exists on `space_members`, profile edit exists, but no upload UI. Profile feels half-done without it. |

---

## Backlog — UX Revamp

| Status | Task | Notes |
|---|---|---|
| ✅ | B2.1 — Unit selection redesign | Replaced PillSelector with `<select>` |
| ✅ | B2.2 — Full UX audit + fixes | QuickLogSheet bug, chip styles, switchSpace wired, invite copy-link |
