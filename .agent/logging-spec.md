# Restock — Logging & Monitoring Spec

> **Stack**: Sentry (errors + alerts) + Axiom (structured logs via Vercel Log Drain)
> **Status**: Packages installed, config files created. Awaiting credentials (see setup steps below).

---

## Architecture

```
Production error occurs
  → Sentry catches it → sends alert email + stores with stack trace
  → Axiom Log Drain captures all Vercel function output → searchable

Developer investigates:
  → Sentry: "what broke and where"
  → Axiom: "what happened in the 5 minutes before it broke"
```

---

## Files Created

| File | Purpose |
|---|---|
| `sentry.client.config.ts` | Sentry init for browser |
| `sentry.server.config.ts` | Sentry init for server (App Router, Server Actions) |
| `sentry.edge.config.ts` | Sentry init for Edge Runtime (middleware) |
| `instrumentation.ts` | Next.js hook that loads Sentry on server startup |
| `src/lib/logger.ts` | Central logger — wraps `next-axiom`, falls back to console in dev |
| `next.config.ts` | Wrapped with `withSentryConfig`, CSP updated |
| `.env.example` | New vars documented |

---

## Setup Steps (do these before first Vercel deploy)

### Step 1 — Create Sentry project

1. Go to [sentry.io](https://sentry.io) → New Project → Next.js
2. Copy the **DSN** (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)
3. Go to Settings → Auth Tokens → Create token with `project:releases` + `org:read` scopes
4. Note your **org slug** and **project slug** from the URL (`sentry.io/organizations/<org>/projects/<project>/`)

### Step 2 — Create Axiom dataset

1. Go to [axiom.co](https://axiom.co) → Datasets → New Dataset → name it `restock-logs`
2. Go to Settings → API Tokens → New Token → read/write on `restock-logs`
3. Copy the token

### Step 3 — Add to Vercel environment variables

In Vercel dashboard → Project → Settings → Environment Variables, add:

| Variable | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Your Sentry DSN | Production + Preview |
| `SENTRY_AUTH_TOKEN` | Your Sentry auth token | Production + Preview |
| `SENTRY_ORG` | Your Sentry org slug | Production + Preview |
| `SENTRY_PROJECT` | Your Sentry project slug | Production + Preview |
| `NEXT_AXIOM_TOKEN` | Your Axiom API token | Production + Preview |
| `NEXT_AXIOM_DATASET` | `restock-logs` | Production + Preview |

### Step 4 — Connect Axiom Log Drain (zero code, captures everything)

1. In Vercel dashboard → Project → Settings → Log Drains → Add Log Drain
2. Select **Axiom** from the integration list
3. Authenticate with your Axiom account
4. Select dataset: `restock-logs`
5. Done — all Vercel function logs now stream to Axiom automatically

---

## How to Use the Logger in Server Actions

```ts
import { log } from '@/lib/logger';

// In a server action:
export async function addEntry(data: EntryInput) {
  try {
    const entry = await db.insert(entries).values({ ...data });
    log.info('entry.add', { itemId: data.itemId, type: data.type, userId, householdId });
    return entry;
  } catch (e) {
    log.error('entry.add.failed', { error: (e as Error).message, itemId: data.itemId, userId });
    throw e; // re-throw so Sentry also captures it
  }
}
```

## Recommended Log Events

| Event | Level | Key Fields |
|---|---|---|
| `entry.add` | info | itemId, type, price, store, userId, householdId |
| `entry.add.failed` | error | error, itemId, userId |
| `entry.update` | info | entryId, changes, userId |
| `entry.delete` | info | entryId, itemId, userId |
| `item.add` | info | itemId, categoryId, householdId |
| `item.delete` | warn | itemId, entryCount, userId |
| `stock.update` | info | itemId, delta, newStock, triggeredBy |
| `auth.login` | info | userId, method (passkey/password) |
| `auth.failed` | warn | username, reason |
| `sync.replay` | info | mutationCount, householdId |
| `sync.failed` | error | mutation, error |
| `household.invite` | info | householdId, inviteeUserId |

---

## Local Development

`next-axiom` detects when `NEXT_AXIOM_TOKEN` is not set and falls back to `console.log`.
No Axiom account needed to develop locally — logs appear in terminal as normal.

Sentry is also suppressed locally (`beforeSend` returns `null` when `NODE_ENV !== 'production'`).

---

## Free Tier Limits

| Service | Free Limit | Expected Usage |
|---|---|---|
| Sentry | 5,000 errors/month | Well within — household app |
| Axiom | 500 GB/month ingest | Effectively unlimited for this scale |
| Vercel Log Drain | Included on all plans | — |
