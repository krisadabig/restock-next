# Restock — AI Design Brief

> **Audience**: This document is written for an AI agent or designer tasked with revamping the Restock app into a best-in-class **stock tracking** tool. It describes the current state, what must be preserved, and a detailed vision for the redesigned experience.

---

## What the App Does Today

Restock is a **personal home inventory + expense tracker** built as a PWA. Users log every time they buy or consume a household item (food, cleaning supplies, personal care, etc.). The app tracks:

- **Entries**: Each row is either a `purchase` or `consume` event with `item`, `price`, `quantity`, `unit`, `date`, and `note`.
- **Inventory**: A live snapshot of current stock per item (`quantity`, `unit`, `status: in-stock | out-of-stock`).
- **Trends**: Month-over-month spending analytics grouped by item.

### Current Tech Stack (do not change)

| Layer | Technology |
|---|---|
| Framework | Next.js 15+ App Router |
| Language | TypeScript |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS 4 |
| Auth | Custom JWT + WebAuthn Passkeys |
| Offline | IndexedDB + Background Sync |
| Testing | Vitest (unit) + Playwright (E2E) |
| i18n | Custom EN / TH |

### Current Data Schema (reference only)

```ts
entries {
  id, item, price, quantity, unit,
  type: 'purchase' | 'consume',
  date, note, userId, createdAt
}

inventory {
  id, item, quantity, unit,
  status: 'in-stock' | 'out-of-stock',
  alertEnabled, userId, lastStockUpdate, createdAt
}
```

---

## Redesign Goals

The core problem: **tracking stock across multiple items is cognitively hard**. Users switch between the dashboard (purchase history) and the inventory view too often to answer a simple question like "how much shampoo do I have left, and when did I last buy it?"

The redesign should make the following **primary questions** answerable at a glance:

1. **What do I have?** — Current quantity per item, clearly displayed.
2. **How fast am I going through it?** — Consumption rate: days-per-unit or units-per-week.
3. **When should I restock?** — Estimated run-out date based on consumption rate.
4. **How much did it cost over time?** — Price history and trend per item.
5. **What is my full timeline for this item?** — Every purchase and consume event in one scrollable view.

---

## UX Vision: Key Screens & Interactions

### 1. Home / Stock Overview (replaces current dashboard)

The main screen should feel like a **living pantry board**, not a spreadsheet.

- **Card-per-item** layout. Each card shows:
  - Item name
  - Current quantity + unit (e.g., `2.5 kg`, `3 bottles`)
  - Visual stock bar (full → empty color gradient: green → amber → red)
  - Estimated days remaining (calculated from average consumption rate)
  - Last restocked date
  - Quick-action buttons: **+ Add Stock** / **− Use**
- **Sort/filter bar**: by category, by stock level (low first), by last activity.
- **Low stock section** pinned at top — items below a user-set threshold surface automatically.
- On mobile (PWA): 1-column card stack, thumb-reachable action buttons at the bottom of each card.
- On desktop: 2–3 column grid of cards with hover states revealing detail.

### 2. Item Detail Page (replaces current `[item]` page)

Tapping any item card opens a full detail view that combines everything about that item in one place:

- **Header**: item name, current stock, unit.
- **Stock gauge**: large, visual ring or bar.
- **Consumption stats panel**:
  - Average usage per week/month
  - Estimated run-out date
  - Average price per unit (rolling last 3 purchases)
- **Full timeline** (chronological, newest first):
  - Each event row shows type (purchase 🛒 / consume 📦), quantity delta, price (if purchase), date, and note.
  - Timeline should be filterable by type.
- **Price chart**: sparkline or bar chart of price-per-unit over time (detect price changes).
- **Quick actions**: Log Purchase, Log Consume, Edit Inventory, Set Alert threshold.

### 3. Log Entry Flow (add purchase or consume)

The log flow must be **fast** — max 3 taps to record a common action.

- **Entry point**: FAB (floating action button) persistent on all screens.
- **Step 1 — Item**: Autocomplete from known items. Selecting an existing item pre-fills unit.
- **Step 2 — Action**: Toggle `Purchase` / `Consume`. Purchase shows price field; Consume does not.
- **Step 3 — Quantity + Date**: Numeric input with unit pill selector. Date defaults to today.
- Optional: note field, collapsible.
- On PWA/mobile: bottom sheet (slides up), not a centered modal.

### 4. Trends & Analytics (enhanced)

- **Overview tab**: Total spend this month vs last month (current feature, keep).
- **Per-item tab** (new): Select an item to see:
  - Monthly consumption bar chart.
  - Price paid over time (line chart).
  - Total spend on this item to date.
- **Insights strip** (new): Auto-generated callouts — "You bought Shampoo 30% more expensive last month" or "Milk usage spiked in May."

### 5. Settings

Keep existing settings. Add:
- **Default units** per item category (e.g., food → kg/g, drinks → bottle/L).
- **Low stock thresholds** per item.
- **Notification preferences** for run-out alerts (PWA push notifications, future scope).

---

## Cross-Platform Requirements

### PWA / Mobile (primary use case)
- All interactions must be reachable with one thumb.
- Bottom navigation bar (max 4 tabs: **Stock**, **Log**, **Trends**, **Settings**).
- Bottom sheets instead of modals for forms.
- Swipe-to-consume or swipe-to-restock on cards (native-app feel).
- Offline-first: all reads and writes work without internet; sync when back online.
- Installable as PWA on iOS and Android.

### Desktop (secondary use case)
- Sidebar navigation instead of bottom bar.
- Multi-column card grid.
- Hover states and keyboard shortcuts for power users.
- Same data, denser layout.

---

## Design Constraints & Must-Preserves

| Constraint | Detail |
|---|---|
| Auth | Existing JWT + Passkeys flow must remain unchanged |
| Data model | Schema can be extended but not broken (entries + inventory tables stay) |
| Offline | IndexedDB + background sync pattern must be preserved |
| i18n | All new copy must have EN and TH keys |
| Dark mode | Full dark mode support required |
| Performance | No heavy chart libraries — CSS/SVG-based charts preferred |
| Accessibility | WCAG AA minimum contrast on all text and interactive elements |

---

## Current Gaps to Address

| Gap | Impact |
|---|---|
| No consumption rate calculation | Users can't predict when to restock |
| Item detail page exists but lacks stats | Timeline is there but isolated from analytics |
| Dashboard shows all entries, not per-item view | Hard to focus on a single item's history |
| No visual stock level indicator | User must mentally parse a number |
| Add entry is a centered modal, not a bottom sheet | Awkward on mobile one-handed use |
| No estimated run-out date | Core value prop of a stock tracker is missing |
| Price history per item is not surfaced | No way to spot price inflation |

---

## Getting Started (Developer)

```bash
# Prerequisites: Node.js 20+, Bun

bun install
cp .env.example .env   # fill in Supabase credentials
bun run db:push
bun dev
```

```bash
bun test          # unit tests (Vitest)
bun run smoke     # fast E2E smoke suite (Playwright)
bun run test:e2e  # full E2E suite
```

Key files for a designer/agent to understand:

| File | What it is |
|---|---|
| `src/lib/db/schema.ts` | Full database schema |
| `src/app/app/actions.ts` | All server mutations (add/edit/delete entry, inventory ops) |
| `src/components/dashboard/` | Current dashboard components |
| `src/components/inventory/` | Current inventory components |
| `.agent/spec.md` | Full feature specification |
| `.agent/retrospective.md` | Past decisions and lessons learned |

---

## License

MIT
