# Restock (Restock Next)

A premium, privacy-focused home inventory and expense tracking application built with the modern web stack.

![Restock Dashboard](./.agent/screenshots/dashboard.png)

## 🚀 Features

- **Inventory Tracking**: Easily add, edit, and delete restock entries with smart autocomplete.
- **Spending Trends**: Visual analytics including Month-over-Month comparisons and top spending categories.
- **PWA Ready**: Installable on iOS, Android, and Desktop with offline capability.
- **Privacy First**: Authenticated via Supabase (Email/Password & Passkeys) with Row Level Security (RLS).
- **Internationalization**: Full support for English (EN) and Thai (TH).
- **Responsive Design**: Mobile-first architecture with premium animations and dark mode support.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via [Supabase](https://supabase.com)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Styling**: Tailwind CSS 4 with custom design tokens
- **Auth**: Supabase Auth (incl. Passkeys support)
- **Testing**: Playwright (E2E & Smoke Testing)

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Bun (mandatory package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:krisadabig/restock-next.git
   cd restock-next
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
    Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

4. **Database Migration**
   ```bash
   bun run db:push
   ```

5. **Run Development Server**
   ```bash
   bun dev
   ```

## 🧪 Testing

We use **Vitest** for unit tests and **Playwright** for E2E/Smoke tests.

```bash
# Run Unit Tests
bun test

# Run Smoke Tests (Fast E2E)
bun run smoke

# Run Full E2E Suite
bun run test:e2e
```

## 🤝 Workflow & Contributing

Please refer to the `.agent/workflows/git-flow.md` for mandatory development rituals, including:
- **Proactive Linting**: `bun run lint` before commits.
- **Directive Checks**: Ensure `'use client';` is correct.
- **Spec Sychronization**: Update `.agent/spec.md` with features.

## 📄 License

MIT
