# Tech Stack Reference

## Core
- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5
- **Runtime**: Bun (Package Manager & Script Runner)

## Frontend & Styling
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 (PostCSS)
- **Icons**: Lucide React
- **Utilities**: `clsx`, `tailwind-merge`, `tailwindcss-animate`
- **Theme**: `next-themes` (Dark/Light mode)

## Data & Backend
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit
- **Local Storage**: `idb` (IndexedDB wrapper for Offline Mode)

## Authentication & Security
- **WebAuthn**: `@simplewebauthn/browser` & `@simplewebauthn/server` (Passkeys)
- **Encryption**: `bcryptjs`
- **Tokens**: `jose` (JWT signing/verification)

## Quality Assurance
- **E2E Testing**: Playwright
- **Unit Testing**: Vitest
- **DOM Testing**: Testing Library, Happy DOM

## Utilities
- **Validation**: Zod
- **Unique IDs**: UUID
