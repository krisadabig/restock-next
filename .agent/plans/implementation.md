# Implementation Plan - Phase 3: Feature Migration

## Goal
Migrate the key application pages (Landing, Login) and the Dashboard shell from SvelteKit to Next.js.

## Proposed Changes

### [NEW] Public Pages
#### `src/app/page.tsx` (Landing Page)
- Migrate Landing Page content from `restock-app`.
- Use `useTranslation` for text.
- Responsive design with Tailwind.
- **Components**: `HeroSection`, `FeatureSection`.

#### `src/app/login/page.tsx` (Login Page)
- Migrate Login form.
- Integrate with `src/lib/auth`.
- Handle WebAuthn interactions (Passkeys).

## Feature Migration (Phase 3)

### [IN_PROGRESS] Landing Page (`src/app/page.tsx`)
- **Source**: `restock-app/src/routes/+page.svelte`
- **Goal**: Full visual parity with responsive design and interactions.
- **Components**:
    - **Hero Section**: Animated title, subtitle, CTA button (Log in / Get Started), Hero Image.
    - **Features Section**: Grid of 3 features (Track History, Analyze Spending, Smart Alerts).
    - **Install App Section**: Instructions for iOS, Android, Desktop (PWA-like).
    - **Footer**: Copyright and branding.
- **Tech**: Tailwind CSS, `lucide-react` icons, `framer-motion` (for `fly` transitions if needed, or CSS animations).

### [TODO] Login Page (`src/app/login/page.tsx`)
- **Source**: `restock-app/src/routes/login/+page.svelte`
- **Goal**: Passwordless login interface using WebAuthn.
- **Components**:
    - Login Form (Username input).
    - WebAuthn handling (Passkey authentication).
    - Fallback/Error states.
    - Redirect to `/app` on success.

### [TODO] Dashboard Shell (`src/app/app/layout.tsx`)
- **Source**: `restock-app/src/routes/app/+page.svelte` (Layout logic extracted)
- **Goal**: Mobile-first layout with Bottom Navigation.
- **Components**:
    - **BottomNav**: Sticky footer with links (History, Add, Trends).
    - **Shell**: Centered container (`max-w-md`) with background.
    - **AuthCheck**: Client-side check for mocked session.

### [TODO] Dashboard Home (`src/app/app/page.tsx`)
- **Source**: `restock-app/src/routes/app/+page.svelte`
- **Goal**: Summary stats and Entry list.
- **Components**:
    - **Header**: Title, Settings button, Item count.
    - **SummaryStats**: Total spent, unique items.
    - **ItemsList**: List of tracked items.
    - **LoadingState**: Skeleton/Spinner.

## Backend Integration (Phase 4)

### [TODO] Database Setup
- **Goal**: Full Drizzle + Postgres integration.
- **Tasks**:
    - [ ] Create `lib/db.ts` (Drizzle Client).
    - [ ] Verify `drizzle.config.ts`.
    - [ ] Create initial migration (`npm run db:generate`, `npm run db:migrate`).
    - [ ] *Test:* Create a simple script to ping DB.

### [TODO] Authentication Implementation
- **Goal**: Real Passkey Auth using `@simplewebauthn`.
- **Tasks**:
    - [ ] Create `users` and `authenticators` tables in `schema.ts`.
    - [ ] Implement `api/auth/register-options`.
    - [ ] Implement `api/auth/verify-registration`.
    - [ ] Implement `api/auth/login-options`.
    - [ ] Implement `api/auth/verify-authentication`.
    - [ ] Updates `login/page.tsx` to use real API endpoint instead of mock.

### [TODO] Entries CRUD
- **Goal**: Real data for Dashboard.
- **Tasks**:
    - [ ] Create `entries` table in `schema.ts`.
    - [ ] Update `app/app/actions.ts` to use Drizzle.
    - [ ] Implement `getEntries`, `addEntry`, `deleteEntry`.
    - [ ] Update `DashboardHome` and `EntryForm` to use real actions.

## Verification Plan

### Automated Tests
- **DB Check**: Run connection test script.
- **Auth Flow**: Playwright E2E for Login (requires resetting DB state or unique users).
- **CRUD**: specific test for adding/listing entries.

### Manual Verification
1. Register new user > Confirm "User Created" in DB.
2. Login > Confirm Session Cookie.
3. Dashboard > Add Item > Refresh > Item Persists.
