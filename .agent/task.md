# Phase 3: Feature Migration

- [x] Landing Page Migrated <!-- id: 0 -->
    - [x] Create `HeroSection` component <!-- id: 1 -->
    - [x] Create `FeatureSection` component <!-- id: 2 -->
    - [x] Create `InstallAppSection` component <!-- id: 3 -->
    - [x] Create `Footer` component <!-- id: 4 -->
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

# Phase 25: SDD Workflow & Inventory System

- [x] Workflow Migration (SDD + TDD Integration) <!-- id: 136 -->
- [x] DX Hardening (Process Leak Fix) <!-- id: 137 -->
- [x] Core Inventory System (Phase 1: DB & Logic) <!-- id: 138 -->
- [x] Inventory UI (Phase 2: Badges & Timeline) <!-- id: 139 -->

# Phase 7: UX/UI Polish & Backlog

- [/] UX/UI Consistency & Decoration <!-- id: 40 -->
    - [x] Audit color palette usage across all pages <!-- id: 41 -->
    - [x] Standardize button and input styles <!-- id: 42 -->
    - [x] Add smooth transitions and micro-animations <!-- id: 43 -->
    - [x] Improve empty states and loading skeletons <!-- id: 44 -->
    - [x] Ensure consistent spacing and typography <!-- id: 45 -->
- [x] Application Specification & Spec Workflow <!-- id: 46 -->
    - [x] Create `.agent/spec.md` with tech stack and core logic <!-- id: 47 -->
    - [x] Update `/resume` workflow to include spec check <!-- id: 48 -->

# Phase 19: Data Portability

- [ ] Export & Share <!-- id: 92 -->
    - [ ] Implement CSV Export <!-- id: 93 -->
    - [ ] Implement Web Share API for Trends <!-- id: 94 -->
