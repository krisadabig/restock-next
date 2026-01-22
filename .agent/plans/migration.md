# Migration Plan: @restock-app (SvelteKit) -> restock-next (Next.js)

## Phase 1: Infrastructure & Configuration
- [ ] **Setup Drizzle ORM**
  - Install dependencies (`drizzle-orm`, `postgres`, `drizzle-kit`).
  - Copy `schema.ts`.
  - Configure `drizzle.config.ts`.
  - Create `lib/db.ts` for database connection.
  - *TDD Check:* Verify DB connection with a simple smoke test.
- [ ] **Environment Configuration**
  - Setup `.env` loading.
- [ ] **Authentication Infrastructure**
  - Port `users` and `authenticators` schema.
  - Port WebAuthn/Passkey logic from `auth.ts`.
  - Implement Session management (Cookies/JWT) using generic Next.js middleware or utilities.
  - *TDD Check:* Unit test for auth utilities.
- [ ] **Internationalization (i18n)**
  - Port `i18n.ts` logic.
  - Setup a simple React Context or hook for translation.
  - *TDD Check:* Unit test translation function.

## Phase 2: Core Components & Layouts
- [ ] **Root Layout**
  - Port `routes/+layout.svelte` to `app/layout.tsx`.
  - Setup Tailwind globals.
- [ ] **UI Components**
  - Port reusable components from `lib/components`.
  - Ensure Tailwind styles match.

## Phase 3: Feature Migration (TDD Loop)
### Feature: Landing Page
- [ ] **Landing Page UI**
  - Port `routes/+page.svelte` to `app/page.tsx`.
  - Verify responsive design.

### Feature: Authentication Flows
- [ ] **Login Page**
  - Port `routes/login` to `app/login/page.tsx`.
  - Implement Login form with WebAuthn.
  - *Test:* Playwright E2E for login flow.
- [ ] **Registration/Signup**
  - If applicable, ensure user creation flow works.

### Feature: Dashboard (App)
- [ ] **Dashboard Layout**
  - Port `routes/app/+layout.svelte`.
- [ ] **Entry Management (CRUD)**
  - **List Entries:** Port fetching logic (use Server Components).
  - **Add Entry:** Port form to Server Action.
  - *Test:* Vitest for data logic, Playwright for UI interaction.
- [ ] **Feedback System**
  - Port Feedback form.

## Phase 4: API & Verification
- [ ] **API Routes**
  - Port `routes/api` endpoints (if external access is needed) or convert to Server Actions.
- [ ] **Final E2E Verification**
  - Run full Playwright suite matching original app capabilities.
