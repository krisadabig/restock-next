# Restock — Project Context

## What This Is
In-house family (couple) stock tracking PWA. Price memory + shared inventory.
Not a consumption tracker. No run-out prediction.

## Specs (read these before implementing anything)
- `.agent/ux-spec.md` — all screens, user journeys, edit flows
- `.agent/data-model-spec.md` — schema, stock count logic, key queries
- `.agent/component-inventory.md` — what to build/rewrite/deprecate + build order
- `.agent/logging-spec.md` — Sentry + Axiom setup, log event catalogue

## Tech Stack
Next.js 16 · TypeScript · Tailwind CSS 4 · Drizzle ORM · PostgreSQL (Supabase) · Vitest · Playwright

## Implementation Rules
1. **Follow the build order** in `.agent/component-inventory.md` — schema → actions → providers → primitives → screens
2. **TDD**: write failing tests before implementing. Unit tests in `src/`, integration tests in `tests/integration/`
3. **Log server actions** using `import { log } from '@/lib/logger'` — see `.agent/logging-spec.md` for event names
4. **No consumption rate or run-out prediction** — removed from scope
5. **All new UI strings** need EN + TH keys in `src/lib/i18n.tsx`
6. **Dark mode required** — every component must work in `.dark` context
7. **WCAG AA contrast** on all text
8. **Authorization**: every server action that accepts a record ID must have a unit test asserting it throws when the session's `householdId` does not own that record. See `src/app/app/actions.test.ts` for the pattern (`vi.hoisted` + mock `@/lib/session` + mock `@/lib/db`).
9. **Confirmation wiring**: every modal/sheet with an `onConfirm` callback must have a test that fires the confirm path and asserts the mutation function was called — not just that the modal closed. See `ItemDetailClient.test.tsx` (`confirm-delete-btn` → `deleteEntryOffline` assertion) for the pattern.

## Local Development
```bash
bun run docker:up        # start local postgres (dev + test DBs)
bun run db:push          # apply schema to local dev DB
bun run db:push:test     # apply schema to test DB
bun dev                  # start Next.js dev server

bun run test:unit        # unit tests (no DB needed)
bun run test:integration # integration tests (requires docker:up)
bun run test:all         # both
```

## Database
- Local dev: `postgres://postgres:postgres@localhost:5432/restock` (docker-compose)
- Local test: `postgres://postgres:postgres@localhost:5432/restock_test` (docker-compose)
- Production: Supabase (see `.env.example`)

## Test Helpers
- `tests/helpers/db.ts` — `createTestDb()`, `resetDb()`, `runMigrations()`
- `tests/helpers/factories.ts` — `makeUser()`, `makeHousehold()`, `makeCategory()`, `makeItem()`, `makeEntry()`

## Design System
See `design.md` for full token reference. Key patterns:
- Glass cards: `glass-card` utility class
- Bottom sheets: `createPortal` + `animate-in slide-in-from-bottom-full`
- FAB: `bg-primary text-white login-glow h-14 w-14 rounded-2xl`
- Status dots: green=in-stock · amber=low · red=out
