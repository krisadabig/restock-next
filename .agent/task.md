# Phase 3: Feature Migration

- [x] Landing Page Migrated <!-- id: 0 -->
    - [x] **Revamp Light Theme** <!-- id: 1 -->
    - [x] Refactor `globals.css` (Split :root/Light and .dark) <!-- id: 2 -->
    - [x] Abstract `.glass` utilities to use variables <!-- id: 3 -->
    - [x] Verify Light Mode Contrast & Screenshots <!-- id: 4 -->
    - [x] Assemble `src/app/page.tsx` <!-- id: 5 -->
    - [x] Add animations (Framer Motion or CSS) to match Svelte transitions <!-- id: 6 -->
    - [x] Verify responsive design <!-- id: 7 -->
- [x] Login Page Migrated <!-- id: 8 -->
    - [x] Create Login UI (`src/app/login/page.tsx`) <!-- id: 9 -->
    - [x] Integrate WebAuthn client (mocked/stubbed first if backend not ready) <!-- id: 10 -->
- [x] Dashboard Shell Created <!-- id: 11 -->
    - [x] Implement `Sidebar` <!-- id: 12 -->
    - [x] Implement `UserMenu` <!-- id: 13 -->
    - [x] Create `src/app/app/layout.tsx` <!-- id: 14 -->
- [x] Dashboard Home Content <!-- id: 15 -->
    - [x] Create simple `EntryList` structure <!-- id: 16 -->

# Phase 4: Backend Integration

- [x] Backend Integration Infrastructure <!-- id: 17 -->
    - [x] Database Setup (`lib/db.ts`, Schema, Migration) <!-- id: 18 -->
    - [x] Auth API Implementation (Register/Login) <!-- id: 19 -->
    - [x] Connect Login UI to Real Auth <!-- id: 20 -->
    - [x] Entries CRUD Implementation <!-- id: 21 -->
    - [x] Connect Dashboard to Real Data <!-- id: 22 -->

# Phase 5: Settings Page

- [x] Settings Page Implementation <!-- id: 23 -->
    - [x] Create `src/app/app/settings/page.tsx` <!-- id: 24 -->
    - [x] Appearance Section (Theme + Language toggles) <!-- id: 25 -->
    - [x] Account Section (Logout button) <!-- id: 26 -->
    - [x] Delete Account flow (modal + confirmation) <!-- id: 27 -->
    - [x] Update BottomNav with Settings link <!-- id: 28 -->
    - [x] Add E2E tests (`tests/e2e/settings.spec.ts`) <!-- id: 29 -->
    - [x] Verify via Playwright MCP <!-- id: 30 -->
    - [x] Run smoke tests <!-- id: 31 -->

# Phase 6: Supabase Auth Integration

- [x] Supabase Auth Implementation <!-- id: 32 -->
    - [x] Install `@supabase/supabase-js` and `@supabase/ssr` <!-- id: 33 -->
    - [x] Update `schema.ts` for UUID and User Sync <!-- id: 34 -->
    - [x] Create Supabase clients (Client/Server) <!-- id: 35 -->
    - [x] Implement traditional Login/Signup UI <!-- id: 36 -->
    - [x] Integrate Passkey enrollment in Settings <!-- id: 37 -->
    - [x] Verify via Playwright MCP <!-- id: 38 -->
    - [x] Run smoke tests <!-- id: 39 -->

# Phase 8: Trends Page & Verification

- [x] Implement Trends Page <!-- id: 49 -->
    - [x] Create `src/app/app/trends/page.tsx` <!-- id: 50 -->
    - [x] Create `src/components/dashboard/TrendsClient.tsx` <!-- id: 51 -->
    - [x] Calculate total spending and top items cost <!-- id: 52 -->
    - [x] Add E2E tests (`tests/e2e/trends.spec.ts`) <!-- id: 53 -->
- [x] RLS Verification <!-- id: 54 -->
    - [x] Verify RLS is enabled on all tables in Supabase <!-- id: 55 -->
    - [x] Verify data isolation in server actions <!-- id: 56 -->

# Phase 9: PWA & Deployment Readiness

- [x] PWA Optimization <!-- id: 70 -->
    - [x] Audit `manifest.json` for all required fields <!-- id: 71 -->
    - [x] Verify service worker registration and offline support <!-- id: 72 -->
    - [x] Test PWA installation on mobile viewports <!-- id: 73 -->
- [x] Deployment Readiness <!-- id: 74 -->
    - [x] Audit environment variables for production <!-- id: 75 -->
    - [x] Verify production build (`bun run build`) <!-- id: 76 -->
    - [x] Check security headers and CSP <!-- id: 77 -->
- [x] **PWA & Hydration Fix**: Switched to Network-First navigation and implemented stale-data re-fetch. <!-- id: pwa-fix -->
- [x] **Inventory Quantity & Unit**: Added quantity/unit tracking to `entries` and `inventory`. <!-- id: inv-qty-unit -->
- [x] **Management UI**: Implemented `ManageInventoryModal` and dashboard integration. <!-- id: inv-manage-ui -->
- [ ] **Inventory Alerts Section**: Group items by alert status. <!-- id: inv-alerts -->

# Phase 10: Workflow Improvements

- [x] Enhance Agent Workflows <!-- id: 60 -->
    - [x] Propose enhancements in `workflow_enhancements.md` <!-- id: 61 -->
    - [x] Update `resume.md` with Branch Locking <!-- id: 62 -->
    - [x] Update `git-flow.md` with Spec Sync & Guardrails <!-- id: 63 -->
    - [x] Update `handoff.md` with Retrospective step <!-- id: 64 -->
    - [x] Final verification of all workflow scripts <!-- id: 65 -->

# Phase 12: Reachability & Premium UI

- [x] Reachability Audit <!-- id: 80 -->
    - [x] Simplify headers and move toggles to Settings <!-- id: 81 -->
- [x] Premium UI Integration <!-- id: 82 -->
    - [x] Integrate 3D Hero illustration <!-- id: 83 -->
    - [x] Add Shimmer CTA and micro-animations <!-- id: 84 -->

# Phase 18: Offline Mode (IndexedDB)

- [x] Value-Add Offline Support <!-- id: 85 -->
    - [x] Install `idb` and create `lib/idb.ts` client wrapper <!-- id: 86 -->
    - [x] Create `SyncEngine` context/hook <!-- id: 87 -->
    - [x] Implement `Cache-First` read strategy (Hydrate from IDB if offline/server fail) <!-- id: 88 -->
    - [x] Implement `Background Sync` for writes (Add/Edit/Delete in IDB -> Flush to Server) <!-- id: 89 -->
    - [x] Add "Offline" & "Syncing" indicators (Subtle/Premium UI) <!-- id: 90 -->
    - [x] Verify via Network Throttling/Offline in Playwright (and Unit Tests) <!-- id: 91 -->

# Phase 20: Visual Maximization (Deep Polish)

- [x] Visual Audit & Proposal <!-- id: 100 -->
    - [x] Capture current state screenshots <!-- id: 101 -->
    - [x] Create `visual_proposal.md` <!-- id: 102 -->
- [x] Deep Dark Mode Enforcement <!-- id: 103 -->
    - [x] Force default Dark Mode (OLED friendly) <!-- id: 104 -->
    - [x] Fix "Light Mode Flash" on hydration <!-- id: 105 -->
- [x] Typography & Micro-Interactions <!-- id: 106 -->
    - [x] Fix Translation Keys (e.g. `app.addEntry`) <!-- id: 107 -->
    - [x] Audit Font Weights and Sizes (Human-Readable) <!-- id: 108 -->
    - [x] Add `active:scale-95` to all interaction points <!-- id: 109 -->
- [x] Premium Components <!-- id: 110 -->
    - [x] Glassmorphism refinement on Cards <!-- id: 111 -->
    - [x] Gradient Data Viz for Trends <!-- id: 112 -->

# Phase 21: Auth Migration (Supabase -> Simple DB)

- [x] Migrate Auth System <!-- id: 113 -->
    - [x] Create JWT session management (`lib/session.ts`) <!-- id: 114 -->
    - [x] Update schema with `passwordHash` and `email` <!-- id: 115 -->
    - [x] Implement Server Actions for Signup/Login/Logout <!-- id: 116 -->
    - [x] Update Middleware to use JWT <!-- id: 117 -->
    - [x] Update UI (Login, Settings) <!-- id: 118 -->
    - [x] Verify E2E Tests <!-- id: 119 -->
    - [x] Remove Supabase Dependencies <!-- id: 120 -->
    - [x] Re-enable Passkey UI & Tests <!-- id: 121 -->

# Phase 22: Governance Upgrade

- [x] Implement Definition of Done Rules <!-- id: 122 -->
    - [x] Create `.agent/rules/definition-of-done.md` <!-- id: 123 -->
    - [x] Create `scripts/verify-task.ts` automation <!-- id: 124 -->
    - [x] Update `manifest.md` enforcement <!-- id: 125 -->
    - [x] Verify verification script itself <!-- id: 126 -->
    - [x] **Hotfix**: Fix Login E2E Test Flakiness (Missing Button) <!-- id: 127 -->

# Phase 23: Workflow CLI Tools

- [x] Implement `start-task` script <!-- id: 128 -->
    - [x] Auto-branch creation <!-- id: 129 -->
    - [x] Implementation Plan template enforcement <!-- id: 130 -->
- [x] Implement `finish-task` script <!-- id: 131 -->
    - [x] Integrate `verify-task` <!-- id: 132 -->
    - [x] Enforce Doc Updates (Manifest, Task) <!-- id: 133 -->
    - [x] Git Commit/Push automation <!-- id: 134 -->

# Phase 24: Governance Fixes

- [x] Commit pending lint fixes and manifest updates <!-- id: 135 -->
- [x] **Bug Fix**: Debugged and fixed "Add Entry" modal not opening on mobile/client nav. <!-- id: 140 -->
- [x] **Bug Fix**: Infinite Network Loop in Dashboard Hydration. <!-- id: 141 -->
- [x] **Optimization**: Modal Navigation (Client-Side State). <!-- id: 142 -->

# Phase 25: SDD Workflow & Inventory System

- [x] Workflow Migration (SDD + TDD Integration) <!-- id: 136 -->
- [x] DX Hardening (Process Leak Fix) <!-- id: 137 -->
- [x] Core Inventory System (Phase 1: DB & Logic) <!-- id: 138 -->
- [x] Inventory UI (Phase 2: Badges & Timeline) <!-- id: 139 -->

# Phase 26: Versioning & Release
- [x] **Version Display**: Expose app version in UI and align with Git tags. <!-- id: 143 -->

# Phase 7: UX/UI Polish & Backlog

- [/] UX/UI Consistency & Decoration <!-- id: 40 -->
    - [x] Audit color palette usage across all pages <!-- id: 41 -->
    - [x] Standardize button and input styles <!-- id: 42 -->
    - [x] Add smooth transitions and micro-animations <!-- id: 43 -->
    - [x] Improve empty states and loading skeletons <!-- id: 44 -->
    - [x] Ensure consistent spacing and typography <!-- id: 45 -->

# Phase 27: Ultimate UI Revamp (Premium PWA)
- [/] UI Redesign & Mobile Fixes <!-- id: ui-revamp -->
    - [ ] Implement "Deep Glass" Design System (Tailwind 4 Variables, Global CSS) <!-- id: ui-ds -->
    - [ ] Redesign Landing Page (Hero, Features, Premium Polish) <!-- id: ui-landing -->
    - [ ] Revamp Login & Signup Pages (Auth Method Selector, Deep Dark) <!-- id: ui-auth -->
    - [ ] Restyle Dashboard (Glass Cards, Floating Bottom Nav) <!-- id: ui-dashboard -->
    - [ ] Update Modals (Add/Edit Entry, Manage Inventory) to Bottom Sheets <!-- id: ui-modals -->
    - [ ] Polish Settings Page (Premium Lists, Profile Header) <!-- id: ui-settings -->
    - [ ] Verify Mobile Responsiveness & "Thumb Zone" Ergonomics <!-- id: ui-verify -->
- [x] Application Specification & Spec Workflow <!-- id: 46 -->
    - [x] Create `.agent/spec.md` with tech stack and core logic <!-- id: 47 -->
    - [x] Update `/resume` workflow to include spec check <!-- id: 48 -->

# Phase 19: Data Portability

- [ ] Export & Share <!-- id: 92 -->
    - [ ] Implement CSV Export <!-- id: 93 -->
    - [ ] Implement Web Share API for Trends <!-- id: 94 -->

# Phase 28: UI Polish & Dark Mode Fixes

- [x] UI Polishing & Verification <!-- id: 144 -->
    - [x] Fixed Tailwind 4 build errors <!-- id: 145 -->
    - [x] "Deep Glass" aesthetic implemented <!-- id: 146 -->
- [x] Dark Theme Palette Fix <!-- id: 147 -->
    - [x] Lighten Dark Mode Primary (#818cf8) <!-- id: 148 -->
    - [x] Lighten Dark Mode Destructive (#f87171) <!-- id: 149 -->
    - [x] Verify Contrast Ratios <!-- id: 150 -->

# Phase 29: Stock Tracking Feature

- [x] Stock Tracking Proposal & Spec <!-- id: 151 -->
    - [x] Analyze current schema <!-- id: 152 -->
    - [x] Create Proposal / Plan <!-- id: 153 -->
- [x] Backend Implementation <!-- id: 154 -->
    - [x] Implement `consumeItem` server action <!-- id: 155 -->
    - [x] Verify `addEntry` stock sync logic <!-- id: 156 -->
- [x] Frontend Implementation <!-- id: 157 -->
    - [x] Create `InventoryCard` component <!-- id: 158 -->
    - [x] Create `src/app/app/inventory/page.tsx` (List) <!-- id: 159 -->
    - [x] Create `src/app/app/inventory/[item]/page.tsx` (Item Details) <!-- id: 164 -->
    - [x] Add Inventory link to BottomNav <!-- id: 160 -->

- [x] Journey Perfection (UI/UX) <!-- id: 166 -->
    - [x] Smart Autocomplete (Add Entry) <!-- id: 167 -->
    - [x] Unit Pill Selector (Add Entry/Inventory) <!-- id: 168 -->
    - [x] Input Hygiene (Auto-trim whitespace) <!-- id: 169 -->
    - [x] Navigation Glow Animations <!-- id: 170 -->
- [ ] Verification <!-- id: 161 -->
    - [x] Create `tests/e2e/inventory.spec.ts` <!-- id: 162 -->
    - [x] Verify manual consumption flow <!-- id: 163 -->

# Phase 30: Dashboard Revamp (Client Architecture)
- [x] Revamp Dashboard Client <!-- id: 171 -->
    - [x] Create `EntryCard.tsx` <!-- id: 172 -->
    - [x] Create `DashboardFilters.tsx` <!-- id: 173 -->
    - [x] Implement distinct event types (Purchase vs Consume) <!-- id: 174 -->
    - [x] Fix Inventory Sync Logic (`revalidatePath`) <!-- id: 175 -->

# Phase 31: Enhancing Agent Configuration

- [x] Analyze existing agent configuration files <!-- id: 176 -->
    - [x] Identify unused skills (Elysia, Yjs, Monorepo). <!-- id: 177 -->
    - [x] Verify rules and workflows. <!-- id: 178 -->
- [x] Create Implementation Plan <!-- id: 179 -->
- [x] Execute Changes <!-- id: 180 -->
    - [x] Delete unused skill directories. <!-- id: 181 -->
    - [x] Update `scripts/start-task.ts` with Smart Skill Recommendations. <!-- id: 182 -->
    - [x] Adopt `next-skills`. <!-- id: 183 -->
    - [x] Adopt `codebase-analysis`. <!-- id: 184 -->
    - [x] Enhance `finish-task` script (Smart Reminders + Auto Git). <!-- id: 185 -->
    - [x] Merge `git-flow.md` into `finish-task.md`. <!-- id: 186 -->
    - [x] Create `scripts/implement-retrospective.ts` and workflow. <!-- id: 187 -->
- [x] Verify Changes <!-- id: 188 -->
- [x] Refine 'finish-task' Safety <!-- id: 189 -->
    - [x] Update `scripts/finish-task.ts` with explicit "Ready to Stage?" warning. <!-- id: 190 -->
    - [x] Verified interactively. <!-- id: 191 -->
- [x] Implement UI-Based Finish Flow (New Request) <!-- id: 192 -->
    - [x] Update `scripts/finish-task.ts` to support `--verify-only` flag (skips git). <!-- id: 193 -->
    - [x] Update `scripts/finish-task.ts` to support `--auto-commit` flag (skips prompts). <!-- id: 194 -->
    - [x] Update `.agent/workflows/finish-task.md` to mandate `notify_user` usage. <!-- id: 195 -->
- [x] Mock Task for Workflow Test <!-- id: mock-test -->
    - [x] Create dummy file. <!-- id: mock-test-1 -->
    - [x] Update docs. <!-- id: mock-test-2 -->
    - [x] Verify workflow. <!-- id: mock-test-3 -->
- [x] Formalize Plan-Based Finish Workflow (New Request) <!-- id: plan-workflow -->
    - [x] Update `.agent/workflows/finish-task.md` to require Plan Artifact creation. <!-- id: plan-workflow-1 -->
    - [x] Clean up mock test files. <!-- id: plan-workflow-2 -->
    - [x] Commit using the new Plan-Based Workflow. <!-- id: plan-workflow-3 -->
- [x] Formalize Plan-Based Commit Workflow <!-- id: formal-workflow -->
    - [x] Update docs (`finish-task.md`) to mandate Plan-Based Workflow for Agents. <!-- id: formal-workflow-1 -->
    - [x] Update script (`finish-task.ts`) with interactive deprecation warning. <!-- id: formal-workflow-2 -->
    - [x] Create mock task and verify the full cycle. <!-- id: formal-workflow-3 -->
- [x] Operationalize Retrospective (Workflow) <!-- id: retro-workflow -->
    - [x] Run `bun scripts/implement-retrospective.ts`. <!-- id: retro-workflow-1 -->
    - [x] Select a lesson (e.g., Linting Scripts). <!-- id: retro-workflow-2 -->
    - [x] Create/Update the corresponding Rule/Skill. <!-- id: retro-workflow-3 -->
- [x] **Safety Protocol (Self-Correction)** <!-- id: safety-1 -->
    - [x] Implement "Halt-on-Commit" rule in `workflow.md`. <!-- id: safety-2 -->
    - [x] Add explicit AGENT WARNING to `finish-task.ts` prompt. <!-- id: safety-3 -->

# Phase 32: Application Visualization

- [x] Visualize Application Structure <!-- id: visualize-app -->
    - [x] Create `docs/reference/` directory. <!-- id: vis-1 -->
    - [x] Generate `file-structure.tree` (Textual representation). <!-- id: vis-2 -->
    - [x] Generate `architecture.md` (Mermaid Diagrams: System Context, Database, Component). <!-- id: vis-3 -->
    - [x] Generate `tech-stack.md` (Comprehensive list of tools/libraries). <!-- id: vis-4 -->
    - [x] Capture Comprehensive UI Screenshots using Playwright. <!-- id: vis-5 -->
        - [x] Landing & Login <!-- id: vis-5a -->
        - [x] Dashboard (Empty & Populated) <!-- id: vis-5b -->
        - [x] Inventory List & Details <!-- id: vis-5c -->
        - [x] Settings <!-- id: vis-5d -->
        - [x] Add/Edit Modals <!-- id: vis-5e -->
    - [x] Compile `README.md` for the reference folder. <!-- id: vis-6 -->

