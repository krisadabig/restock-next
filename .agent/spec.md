# Restock Application Specification

## Overview
Restock is a web application designed to help users track their grocery stock, prices, and shopping history. It focuses on speed and simplicity, with a premium UI and robust authentication.

## Tech Stack
- **Framework**: Next.js 16+ (App Router)
- **Authentication**: Supabase Auth (Primary: Email/Password, Secondary: WebAuthn Passkeys)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4+
- **Testing**: Playwright (E2E and Smoke Tests)
- **I18n**: Custom implementation supporting English (EN) and Thai (TH)

## Core Logic & Data Flow

### 1. Authentication
- **Registration**: Users sign up via Supabase Auth. A database trigger (`supabase_trigger.sql`) automatically creates a profile in the `public.users` table.
- **Login**: Primary login is via Email/Password.
- **Passkeys**: Users can enroll their device as a Passkey in the Settings page for secure, biometric login.
- **Sessions**: Managed via Supabase middleware (`src/middleware.ts`) which refreshes tokens on every request.

### 2. Entries Tracking
- **Schema**: Defined in `src/lib/db/schema.ts`. Each entry contains `item`, `price`, `date`, `note`, and `userId`.
- **CRUD Operations**: Handled via Server Actions in `src/app/app/actions.ts`.
- **Data Isolation**: All entries are scoped to the `userId` of the authenticated user.

### 3. Settings & Personalization
- **Theme**: Supports Light and Dark modes, persisted in `localStorage`.
- **Language**: Supports EN and TH, managed via a custom context provider.
- **Passkey Management**: Enrollment UI in Settings links WebAuthn credentials to the Supabase User ID.

### 4. Trends & Analytics
- **Spending Dashboard**: Visualizes spending habits at `src/app/app/trends/page.tsx`.
- **Metrics**: Calculates total spending and groups costs by item category/name.
- **Visualization**: Uses modern CSS and Tailwind animations for progress bars and metric cards instead of external charting libraries for lightness.

## Directory Structure
- `src/app/`: Next.js App Router routes.
- `src/components/`: Reusable UI components (Dashboard, Shared, etc.).
- `src/lib/`: Core utilities (Auth, DB, Supabase, i18n).
- `tests/`: Playwright E2E tests.
- `.agent/`: Agent-specific documentation and workflows.

## Design Philosophy
- **Rich Aesthetics**: Vibrant colors, dark mode support, and smooth transitions.
- **Mobile First**: Fully responsive layout for tracking groceries on the go.
- **Performance**: Heavy use of React Server Components and optimized data fetching.
