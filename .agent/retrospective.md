
# Retrospective Log

## [2026-01-30] Session: UI Polishing & Verification

### Lessons Learned 🧠
- **Tailwind 4 & PostCSS**: `CssSyntaxError` with `@apply` often comes from using non-standard utilities or complex variants (like `dark:`) directly in `@apply`. It's safer to use standard CSS nesting (`&:where(.dark, ...)`).
- **Test Hydration**: Components that rely on client-side hydration (like `ThemeToggle`) must be tested with `findBy` (async) queries rather than `getBy` (sync) to allow for the mounting effect to clear.
- **Provider Mocking**: Integration tests for components using libraries like `next-themes` require the component to be wrapped in the actual Provider during tests, rather than relying on global mocks that miss the side-effects (like class toggling).

### Upgrades Implemented 🚀
- **Robust Styling**: Refactored `globals.css` to use standard, nested CSS for complex variants, eliminating build fragility with Tailwind 4 parser.
- **Visual Polish**: Implemented "Deep Glass" aesthetic across Login, Dashboard, and Settings pages.
- **Test Reliability**: Updated `ThemeToggle` tests to be async-aware and properly wrapped, reducing flake.
- **Browser Verification**: Used browser subagent to visually verify UI states, complementing automated tests.

---

## [2026-01-29] Session: Inventory Quantity & PWA Fixes

### Lessons Learned 🧠
- **PWA Freshness**: "Cache-First" strategies for navigation requests in Service Workers can accidentally serve stale HTML shells. Switching to "Network-First" for navigation ensures the user always gets the latest app shell while keeping assets cached.
- **E2E Test Stability**: Local dev servers can be slow, causing timeouts in Playwright. Increasing timeouts helps, but sometimes manual verification via screenshots is a necessary fallback when the environment is flaky.
- **Drizzle Kit Limitations**: Relying solely on `db:push` can block progress if it fails. Manual migration scripts using raw SQL via the Drizzle client are essential backups.

### Upgrades Implemented 🚀
- **Inventory Enhancement**: Added `quantity` and `unit` bubbles to the dashboard and management modal.
- **PWA Stability**: Fixed the "stale app" bug by updating Service Worker strategy and adding a client-side freshness check.
- **Test Robustness**: Added global timeouts to Playwright config to better handle slower environments.

### Preventive Measures 🛡️
- **Manual Verification Fallback**: Automate what you can, but always have a mechanism (browser subagent) to verify manually when automation is flaky.
- **Network-First Default**: Default to Network-First strategies for critical PWA navigation routes to avoid stale data nightmares.

---

## [2026-01-29] Session: Debugging Add Entry Interaction

### Lessons Learned 🧠
- **React State vs Props**: Initializing state from props (e.g., `useState(prop)`) is a one-time operation. If the prop updates (like from a URL change), the state won't reflect it unless synchronized via `useEffect` or `key`.
- **Database Connection Limits**: Running too many concurrent E2E tests locally can exhaust Postgres connections (`Max client connections reached`). Limiting workers (`--workers=1`) for focused debugging is crucial.

### Upgrades Implemented 🚀
- **DashboardClient**: Added `useEffect` to sync `activeModal` with `showAddModal` prop, fixing the "Add Entry" button on mobile/client nav.

---

---

## [2026-01-29] Session: Network Optimization & Modal Fixes

### Lessons Learned 🧠
- **Hydration Loops**: Be extremely careful with `useEffect` that updates state affecting its own dependencies (indirectly via `router.refresh()` -> props). Always use `useRef` to track processed timestamps if you must sync props to state.
- **RSC vs Client State**: Using URL query params (`?modal=true`) for modals in Next.js App Router forces a Server Roundtrip (RSC). For UI-only state like modals, **Client Context** (`UIProvider`) is vastly superior (Instant vs ~200ms).
- **Infinite Loops**: Tools like `playwright` are essential to catch infinite loops that might be subtle during manual testing but devastating in production.

### Upgrades Implemented 🚀
- **Performance**: Reduced "Add Entry" modal interaction cost from ~800 requests/5s (bug) or 1 request (standard) to **0 requests**.
- **Stability**: Fixed infinite hydration loop in `DashboardClient` and `OfflineContext`.
- **Architecture**: Introduce `UIProvider` for lightweight global UI state.
- **Workflow**: Adopted **Git Flow** (`main` protected, `develop` integration). Added `scripts/release.ts` for automated releases.

---

## [2026-01-29] Session: Inventory System & SDD Workflow

### Lessons Learned 🧠
- **Spec-Driven Development (SDD)**: Mandating a spec check in `start-task.ts` ensures implementation stays aligned with design. It prevents "feature creep" and "logic drift."
- **DB Mocking in Unit Tests**: Always mock `db` calls in unit tests to prevent flaky dependencies on the local postgres instance. Use `vi.mock('@/lib/db', ...)` with `mockReturnThis()` for fluent ORM builders like Drizzle.
- **Manual Migrations**: `drizzle-kit push` can sometimes fail due to complex SQL constraints or driver issues. Having a `manual-migrate.ts` script for raw SQL execution is a robust fallback for development.
- **Serialization in Next.js 16/React 19**: Passing functions like `onClose` to `"use client"` components now triggers warnings if not marked as actions. Renaming to `onCloseAction` and ensuring they are compliant is key for build safety.

### Upgrades Implemented 🚀
- **SDD Integration**: Added "Skill Discovery" and "Spec Check" to `start-task.ts`.
- **Governance Enforcement**: `finish-task.ts` now warns if `src/` changes without corresponding `spec.md` updates.
- **Inventory Engine**: Implemented stateful tracking of grocery items with auto-sync from purchase entries.
- **Timeline Modal**: Created a high-end visual timeline for item price history and stock trends.
- **DX Hardening**: Resolved hanging test processes by optimizing Playwright and Vitest CLI flags.

### Preventive Measures 🛡️
- **Pre-execution Spec Sync**: Always verify `.agent/spec.md` exists and is current before starting new feature work.
- **Mock-First Testing**: Establish a pattern of mocking infrastructure (DB, external APIs) in all unit tests to ensure high speed and reliability.
- **Portals for Modals**: Use React Portals by default for all mobile-first modals to avoid z-index and layout stacking issues.

---

## [2026-01-25] Session: Style Cleanup & Modal Refinement

### Lessons Learned 🧠
- **Next.js 16 Migration**: When renaming `middleware.ts` to `proxy.ts`, the exported function MUST also be renamed from `middleware` to `proxy`. The build will fail otherwise.
- **PWA UX**: For a "Premium" feel, Modal interactions (Add/Edit/Delete) must be Optimistic. Waiting for the server/DB causes a noticeable "freeze" that feels broken on mobile.
- **Script Safety**: `git add -A` in scripts is dangerous. It's better to list changed files and let the user (or a smarter script) decide.

### Upgrades Implemented 🚀
- **finish-task.ts**: Enhanced to show `git status` output instead of blind adding.
- **proxy.ts**: Correctly implemented Next.js 16 Proxy convention.
- **Visual Consistency**: Unified Modal styles across CRUD operations.
- **Governance Automation**: If you don't enforce documentation updates in code (scripts), they won't happen. Hard blocks are necessary for discipline.
- **Zero Warnings**: Warnings are errors waiting to happen. Enforcing `max-warnings=0` keeps the codebase pristine and prevents "broken windows".
- **Closed Loops**: Governance is only effective if mistakes lead to permanent fixes. The "Retro -> Backlog" loop ensures this.
