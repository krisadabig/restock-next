# Restock — Project Context

## What This Is
In-house family (couple) stock tracking PWA. Price memory + shared inventory.
Not a consumption tracker. No run-out prediction.

## Agent docs (read these before implementing anything)

| File | Purpose |
|---|---|
| `.agent/as-is.md` | **Current app reality** — routes, schema, server actions, context APIs, component interfaces. Read first. Update when anything changes. |
| `.agent/build-status.md` | What's ✅ done and what's 🔲 next. Update before ending any session. |
| `.agent/ux-spec.md` | Screen specs and user journeys — desired behaviour |
| `.agent/data-model-spec.md` | Schema design rationale and key query patterns |
| `.agent/logging-spec.md` | Axiom log event catalogue |
| `.agent/backlog.md` | Deferred features and known issues |

**Update rule**: Any change to a route, server action, schema column, context API, or top-level component interface **must** be reflected in `.agent/as-is.md` in the same session.

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
bun run docker:up          # start local postgres (dev + test DBs)
bun run db:generate        # generate SQL migration file from schema changes
bun run db:migrate         # apply migrations to local dev DB
bun run db:migrate:test    # apply migrations to local test DB
bun run db:migrate:prod    # apply migrations to production DB (uses DATABASE_URL env)
bun dev                    # start Next.js dev server

bun run test:unit          # unit tests (no DB needed)
bun run test:integration   # integration tests (requires docker:up)
bun run test:all           # both
```

**Schema change workflow**: edit `src/lib/db/schema.ts` → `bun run db:generate` → commit the generated `.sql` file → `bun run db:migrate` (local) / `bun run db:migrate:prod` (production). Never use `drizzle-kit push` — it introspects the live DB and is unreliable.

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
- Bottom sheets: use `<BottomSheetContainer>` (`src/components/ui/BottomSheetContainer.tsx`) — handles portal, backdrop, and animation. Do not repeat the pattern manually.
- FAB: `bg-primary text-white login-glow h-14 w-14 rounded-2xl`
- Status dots: green=in-stock · amber=low · red=out
