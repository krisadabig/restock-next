# Phase 3: Feature Migration

- [x] Landing Page Migrated <!-- id: 0 -->
    - [x] Create `HeroSection` component <!-- id: 1 -->
    - [x] Create `FeatureSection` component <!-- id: 2 -->
    - [x] Create `InstallAppSection` component <!-- id: 3 -->
    - [x] Create `Footer` component <!-- id: 4 -->
    - [x] Assemble `src/app/page.tsx` <!-- id: 5 -->
    - [ ] Add animations (Framer Motion or CSS) to match Svelte transitions <!-- id: 6 -->
    - [ ] Verify responsive design <!-- id: 7 -->
- [x] Login Page Migrated <!-- id: 8 -->
    - [x] Create Login UI (`src/app/login/page.tsx`) <!-- id: 9 -->
    - [x] Integrate WebAuthn client (mocked/stubbed first if backend not ready) <!-- id: 10 -->
- [x] Dashboard Shell Created <!-- id: 11 -->
    - [x] Implement `Sidebar` <!-- id: 12 -->
    - [x] Implement `UserMenu` <!-- id: 13 -->
    - [x] Create `src/app/app/layout.tsx` <!-- id: 14 -->
- [x] Dashboard Home Content <!-- id: 15 -->
    - [x] Create simple `EntryList` structure <!-- id: 16 -->
- [x] Backend Integration (Phase 4) <!-- id: 17 -->
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

