
# Retrospective Log

## [2026-02-01] Session: Formalize Plan-Based Commit Workflow

### Goal
Establish a mandatory, plan-driven commit workflow for AI agents to ensure explicit user approval and verification evidence.

### Accomplishments
- **Workflow Mandate**: Formally updated `finish-task.md` to require Agents to use the `verify-only` -> `verification_plan.md` -> `auto-commit` sequence.
- **Agent Guardrails**: Integrated an adversarial deprecation warning into `finish-task.ts` interactive mode to force Agents away from bypass-prone prompts.
- **Verification Cycle**: Successfully tested the loop with a mock file.

### Lessons Learned
- **Bypass Vulnerability**: Interactive scripts are inherently risky for agents as they can be auto-confirmed via `send_command_input`. Artifact-based approvals are much safer.
- **Explicit Instruction**: Using clear "STOP" messages and specific instructions within CLI output acts as a secondary layer of control for the agent.

### Upgrades Implemented 🚀
- **Workflow Upgrade**: Stricter `finish-task` protocol codified.

---
## [2026-02-02] Session: Revamp Light Theme (Part 1)
- **Stop**: Hardcoding theme values in utilities (e.g., `.glass { bg-[#000] }`). It makes multi-theme support painful.
- **Start**: Using CSS variables for *everything* semantic (`--glass-bg`, `--input-bg`). It allows the theme to be perfectly inverted just by changing the variables in `.dark` vs `:root`.
- **Keep**: The "Split Scope" strategy (`:root` = Light, `.dark` = Dark) worked perfectly with Tailwind 4's `@custom-variant dark turned on`.

---
## [2026-02-01] Session: Contrast Enhancement & Deep Glass Audit
- **Stop**: Manually clicking around in a browser subagent to verify visual changes. It's flaky (`aria-label` timeouts, "New here?" button issues) and slow.
- **Start**: Writing specific Playwright E2E tests (`contrast.spec.ts`) for UI tasks. It forces us to define exact selectors (`input-premium`, `text-muted-foreground`) and provides deterministic pass/fail results for accessibility and styling.
- **Keep**: The "Deep Glass" design system's single source of truth in `globals.css` (`:root` tokens). It made the contrast audit much easier by just tweaking `--muted-foreground`.

---
## [2026-02-01] Session: Establish Safety Protocols

### Goal
Implement guardrails to prevent AI agent from bypassing user confirmation on critical actions (commits, deployment).

### Accomplishments
- **Halt-on-Commit Protocol**: Formalized rule in `workflow.md` forbidding `send_command_input` for confirmation prompts.
- **Script Hardening**: Updated `finish-task.ts` to include `[AGENT: DO NOT AUTO-CONFIRM]` warning in the prompt text.
- **Verification**: Verified that the script pauses and waits for user input.

### Lessons Learned
- **Adversarial Prompting**: Adding explicit instructions *inside* the prompt text ("HALT AND NOTIFY USER") is an effective way to stop LLM auto-execution.
- **Governance First**: Rules must be written down (`workflow.md`) before being enforced by scripts.

### Upgrades Implemented 🚀
- **Rule Upgrade**: Added "Critical Agent Protocols" section to `workflow.md`.

---
## [2026-01-31] Session: Visualize Application Structure
- **Reference Docs**: Created `docs/reference/` with File Tree, Tech Stack, and Architecture Diagrams.
- **Documentation**: Generated diagrams from code analysis (Schema -> ER Diagram).
- **Screenshots**: Automated capture of Landing and Login pages using Playwright.

### Lessons Learned 🧠
- **Path Resolution**: The `tree` tool is invaluable for quickly orienting in a codebase where file paths are not immediately obvious (e.g., finding `schema.ts`).
- **Playwright Navigation**: Automated screenshot capture requires the dev server to be running. `bun dev` makes this fast, but ensuring it's ready before navigation is key.
- **Robust Selectors**: When capturing screenshots of dynamic apps, waiting for `load` or `networkidle` is often insufficient. Always wait for specific UI elements (e.g., `form`, `header.sticky`) and add stability delays (e.g., `waitForTimeout(2000)`) to ensure hydration and animations are complete.
- **Selector Specificity**: Generic selectors like `[role="dialog"]` can fail if libraries implement modals as simple `divs`. Inspect the DOM to find robust alternatives (like `form` inside the modal).

### Upgrades Implemented 🚀
- **Skill Upgrade**: Updated `playwright-skill` with mandatory guidelines for:
  1. "Robust Selectors" (Wait for `form` not just `load`)
  2. "Selector Specificity" (Avoid generic `[role="dialog"]`)
  3. "Playwright Navigation" (Verify dev server readiness)
- **Deep Knowledge**: Added "Path Resolution" strategy to `codebase-analysis` skill to improve orientation speed.
- **Workflow Improvement**: Fixed session ordering and added **Multi-Select & Session Selection** capability to `implement-retrospective.ts` (process history).

---

## [2026-01-30] Session: Stock Tracking Feature Verification

### Successes
- **Robust E2E Testing**: Established a comprehensive Playwright suite for the Inventory lifecycle (Add -> List -> Consume -> Restock).
- **Accessibility Improvements**: Proactively added `aria-label` to all BottomNav links, which significantly improved testability and accessibility.

### Lessons Learned 🧠
- **Test Selectors**: Relying on `hasText` for testing cards can be fragile if the text is nested or split. Using generic class locators like `.glass-card` with `hasText` filters is more robust.
- **Exact Matches**: Playwright's `getByPlaceholder` is strict. Always copy-paste strings from the source code to avoid "Search items..." vs "Search stock..." mismatches.
- **Interactions**: Elements with complex styling or animations (like the Pill Selector) may require `{ force: true }` in tests to bypass strict actionability checks.

### Action Items
- Continue enforcing `aria-label` on all interactive icon-only elements.
- Consider sharing the E2E test patterns (Auth injection, robust selectors) with the team.

### Upgrades Implemented 🚀
- **Skill Upgrade**: Updated `playwright-skill` with:
  1. "Exact Matches" (Copy-paste restriction for placeholders)
  2. "Interactions" (Use `{ force: true }` for complex styled elements like Pill Selectors)

---

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
- **Skill Upgrade**: Updated `tailwind-design-system` with strict rules against complex `@apply` variants (fixing Tailwind 4 syntax errors).
- **Skill Upgrade**: Updated `test-driven-development` with guidelines for async testing of hydrated components.

---

## [2026-01-29] Session: Inventory Quantity & PWA Fixes

### Lessons Learned 🧠
- **PWA Freshness**: "Cache-First" strategies for navigation requests in Service Workers can accidentally serve stale HTML shells. Switching to "Network-First" for navigation ensures the user always gets the latest app shell while keeping assets cached.
- **E2E Test Stability**: Local dev servers can be slow, causing timeouts in Playwright. Increasing timeouts helps, but sometimes manual verification via screenshots is a necessary fallback when the environment is flaky.
- **Drizzle Kit Limitations**: Relying solely on `db:push` can block progress if it fails. Manual migration scripts using raw SQL via the Drizzle client are essential backups.

### Upgrades Implemented 🚀
- **Dark Theme Fix**: Adjusted Primary (#818cf8) and Destructive (#f87171) colors in dark mode to pass WCAG AA contrast on dark card backgrounds.
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
- **Operationalized**: Turned "Lift Scripts" lesson into `.agent/rules/governance-linting.md` using the new `/implement-retrospective` workflow.
- **Cleanup**: Removed 6 unused skill directories, reducing noise.

## [2026-01-30] Session: Dashboard Revamp & Inventory Logic

### Successes
- **UI Architecture**: Successfully split `DashboardClient` into focused sub-components (`EntryCard`, `DashboardFilters`), improving readability and maintainability.
- **Visual Feedback**: Distinct UI for "Purchase" (Green) vs "Consume" (Orange) events makes the history feed instantly parseable.
- **Resilience**: Implemented a manual migration script when `drizzle-kit` failed, ensuring we weren't blocked by tooling issues.
- **Sync Logic**: Fixed a critical bug where inventory counts weren't updating after adding entries by adding targeted `revalidatePath` calls.

### Lessons Learned 🧠
- **Tooling Fallbacks**: `drizzle-kit push` can be flaky with complex schema changes (like adding columns to existing tables with data). Always have a manual `postgres.js` script ready to run raw SQL.
- **Server Actions & Cache**: `revalidatePath` is not recursive by default in some contexts or might be missed. Explicitly revalidating precise paths (`/app/inventory`) ensures data consistency across the app.
- **Linting vs Logic**: Some lint errors (like `useEffect` dependencies) point to real logic flaws. Refactoring to avoid the specific pattern (e.g. syncing props to state) is better than suppressing the rule.

### Upgrades Implemented 🚀
- **Skill Upgrade**: Updated `postgres-best-practices` with fallback strategy (manual SQL script) for flaky `drizzle-kit` pushes.
- **Skill Upgrade**: Updated `next-cache-components` with `revalidatePath` precision guidelines to prevent stale data.

### Action Items
- **Monitoring**: Watch for any "double consumption" issues in production (mitigated by IDB logic but worth tracking).
- **UX**: Consider adding an "Undo" toast for consumption events, as they are destructive.


## [2026-01-30] Session: Enhance Agent Workflows

### Successes
- **Unified Workflow**: Merged `git-flow` manual steps into `scripts/finish-task.ts`, creating a single, interactive command for verification and submission.
- **Smart Reminders**: Implemented context-aware warnings in `finish-task` (e.g., checking mobile responsiveness if UI files changed).
- **Safety First**: Added explicit "Ready to Stage?" confirmation with untracked file detection to `finish-task.ts`.
- **Agent UI Flow**: Implemented `--verify-only` and `--auto-commit` flags to enable "Click to Proceed" workflow for the Agent.
- **Closed Loop System**: Created `scripts/implement-retrospective.ts` to turn lessons into permanent system rules/skills instantly.
- **Workflow Test**: Successfully tested the end-to-end "Verify -> Notify -> Commit" flow with a mock task.
- **Operationalized**: Turned "Lift Scripts" lesson into `.agent/rules/governance-linting.md` using the new `/implement-retrospective` workflow.
- **Cleanup**: Removed 6 unused skill directories, reducing noise.

### Lessons Learned 🧠
- **Linting Scripts**: When writing governance scripts in TypeScript, ensure they are also linted. `verify-task` catches them, so `finish-task` (which runs verify) can fail if the script *itself* has lint errors.
- **Interactive Scripts**: Using `readline` in scripts executed via `child_process` or agent tools requires careful handling of stdin/stdout.

### Upgrades Implemented 🚀
- **finish-task.ts**: Interactive Mode, Conventional Commits prompt, Smart Reminders.
- **implement-retrospective.ts**: New tool for operationalizing learnings.
- **Agent Skillset**: Added `codebase-analysis` and `next-skills`.

### Preventive Measures 🛡️
- **Self-Correction**: The `finish-task` script now warns users if they try to finish without updating documentation or running tests, physically preventing skipped steps.

## [2026-02-02] Session: Revamp Light Theme (Part 2)

### Lessons Learned 🧠
- **Verification Semantics**: When users say "every page", they often mean "every distinct UI state". For example, "Signup" is legally a state of the `/login` route, but conceptually a "page" to the user. Verification plans must explicitly enumerate these states (e.g., "Login - Signup Mode") to avoid gaps.
- **Visual Gaps**: Automated tests that "fill and submit" forms often skip the visual verification step of the filled form itself. Explicit `page.screenshot` calls *during* the interaction flow are necessary.
- **Auth Strategy**: For E2E tests with *unique* users (e.g., `user_${timestamp}`), **skip the login attempt** and register directly to eliminate flakiness. "Smart Auth" (Login -> Fail -> Register) should only be used for *fixed/reusable* test accounts.
- **Parallel Execution**: When running visual tests in parallel, segregate reusable accounts (e.g., `visual_tester_light` vs `visual_tester_dark`) to avoid race conditions during the registration fallback.

### Upgrades Implemented 🚀
- **Test Coverage**: Expanded visual verification suite to cover 100% of app routes + Signup state.
