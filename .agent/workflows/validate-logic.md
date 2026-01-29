---
description: Validate that the codebase implementation matches the documented logic in .agent/spec.md
---

# Logic Validation Workflow

This workflow ensures the implementation stays in sync with the documented specification.

## 1. Review Specification
Read `.agent/spec.md` (derived from `docs/project_spec.md`).

## 2. Check Core Features

### Authentication Flow
- [ ] Registration generates WebAuthn challenge
- [ ] Authenticator credentials stored in DB
- [ ] Login verifies signature and counter
- [ ] JWT issued on successful auth

### Bill Creation & Editing
- [ ] Bills created via `POST /bills`
- [ ] WebSocket endpoint exists at `ws://api/bills/{id}`
- [ ] Yjs state loaded from `bill_states`
- [ ] Updates persisted to `bill_updates`

### Database Schema
- [ ] Users table exists with `currentChallenge` field
- [ ] Authenticators table linked to Users
- [ ] Bills table has `totalAmount` and `paidBy`
- [ ] BillStates table stores Yjs document as BYTEA

## 3. Verify API Routes
Check that documented routes in spec match implementation:
```bash
# List all routes (if Elysia provides introspection)
# Or manually check apps/api/src/app.ts
```

Compare with API Reference in `.agent/spec.md` section 5.

## 4. Test Real-time Sync
1. Open bill in two browser tabs
2. Edit in one tab
3. Verify changes appear in second tab
4. Check `bill_updates` table for new rows

## 5. Report Discrepancies
If implementation doesn't match spec:
- Document the drift in `.agent/backlog.md`
- OR update `.agent/spec.md` if spec is outdated
