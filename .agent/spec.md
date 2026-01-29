# Restock Application Specification

## Overview
Restock is a web application designed to help users track their grocery stock, prices, and shopping history. It focuses on speed and simplicity, with a premium UI and robust authentication.

## Tech Stack
- **Framework**: Next.js 16+ (App Router)
- **Authentication**: Custom DB Auth (Bcrypt + JOSE/JWT) + WebAuthn Passkeys
- **Database**: PostgreSQL (Managed via Drizzle)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4+
- **Testing**: Playwright (E2E/Smoke) + Vitest (Unit)
- **I18n**: Custom implementation supporting English (EN) and Thai (TH)
- **Offline**: IndexedDB + Background Sync Pattern

## Core Logic & Data Flow

### 0. Offline Capabilities
- **Philosophy**: "Optimistic UI, Event Consistency".
- **Storage**: Entries are cached in IndexedDB via `idb` library.
- **Mutations**: Write operations (`add`, `edit`, `delete`) are optimistically applied to UI and queued in IDB if offline.
- **Sync**: A `SyncEngine` monitors online status and re-drives queued mutations sequentially when connectivity is restored.

### 1. Authentication
- **Registration**: Self-hosted. `signup` action hashes password (`bcryptjs`) and creates user in `users` table.
- **Login**: `login` action verifies hash. On success, signs a JWE (Encrypted JWT) via `jose`.
- **Session**: JWE token stored in `session` HTTP-only cookie. Middleware verifies this cookie for protected routes.
- **Passkeys**: Integrated via `simplewebauthn`. Supports "Usernameless" login. Passkey login issues the same JWE session cookie.

### 2. Entries Tracking
- **Schema**: Defined in `src/lib/db/schema.ts`. Each entry contains `item`, `price`, `date`, `note`, and `userId`.
- **CRUD Operations**: Handled via Server Actions in `src/app/app/actions.ts`. Includes `addEntry`, `updateEntry`, and `deleteEntry`.
- **Validation**: All server actions utilize **Zod** for input validation and schema enforcement.
- **Search & Filtering**: `DashboardClient.tsx` implements client-side search (by item name) and date filtering (by month).
- **Data Consistency**: The application uses a `getUniqueItems` server action to provide **autocomplete suggestions** (via `<datalist>`) when adding or editing items.
- **Data Isolation**: All entries are scoped to the `userId` of the authenticated user.

### 3. Settings & Personalization
- **Theme**: Supports Light and Dark modes, persisted in `localStorage`.
- **Language**: Supports EN and TH, managed via a custom context provider.
- **Passkey Management**: Enrollment UI in Settings links WebAuthn credentials to the Supabase User ID.

- **Timeline Tracking**: A chronological "reconstruction" of an item's history.
    - **Data Sources**: Combines `entries` (purchases) and `inventory.lastStockUpdate`.
    - **Logic**: For any given item, the timeline shows:
        1. Date of first purchase.
        2. History of prices paid.
        3. Most recent "Out of Stock" or "In Stock" status change.
        4. "Time since last restock" metric.
- **Dashboard UI**:
    - **Stock Badges**: Items in the list display a badge: 🟢 (In Stock) or 🔴 (Out of Stock).
    - **Quick Toggle**: A button on the dashboard to toggle stock status without opening a full edit form.
    - **Alerts Section**: Sticky top-bar or separate section for items marked as `out-of-stock` if `alertEnabled` is true.

### 4. Trends & Analytics
- **Spending Dashboard**: Visualizes spending habits at `src/app/app/trends/page.tsx`.
- **Metrics**: Calculates total spending, groups costs by item, and provides **Month-over-Month (MO-M)** comparison.
- **Visualization**: Uses modern CSS and Tailwind animations for progress bars and metric cards instead of external charting libraries for lightness.

## Directory Structure
- `src/app/`: Next.js App Router routes.
- `src/components/`: Reusable UI components (Dashboard, Shared, etc.).
- `src/lib/`: Core utilities (Auth, DB, Supabase, i18n).
- `tests/`: Playwright E2E tests.
- `.agent/`: Agent-specific documentation and workflows.

## Design Philosophy
- **Rich Aesthetics**: Vibrant colors, dark mode support, and smooth transitions.
- **Mobile First**: Fully responsive layout for tracking groceries on the go, with optimized grid layouts for tablet viewports.
- **PWA**: Progressive Web App features including service worker caching for offline support and manifest metadata.
- **Security**: Strict Content Security Policy (CSP) and security headers (X-Frame-Options, X-Content-Type-Options) enabled in `next.config.ts`.
- **Performance**: Heavy use of React Server Components and optimized data fetching.
- **UI Architecture**: heavily relies on **React Portals** (`createPortal`) for overlays (Modals) to ensure correct z-index stacking on complex mobile viewports.
