---
description: Validate API implementation and tests
---

# API Validation Workflow

## 1. Run Unit Tests
```bash
# // turbo
bun test
```

Verify all tests pass.

## 2. Check Linting
```bash
# // turbo
bun run lint
```

## 3. Start API Server
```bash
bun d:api
```

Server should start on port 3000 (or configured PORT).

## 4. Manual Endpoint Testing

### Authentication Endpoints
```bash
# Test registration options
curl http://localhost:3000/auth/register/options?name=TestUser

# Expected: JSON with challenge and options
```

### Protected Endpoints
```bash
# Test without auth (should fail)
curl http://localhost:3000/users/me

# Expected: 401 Unauthorized
```

### WebSocket Connection
Open browser console:
```javascript
const ws = new WebSocket('ws://localhost:3000/bills/test-id');
ws.onopen = () => console.log('Connected');
```

## 5. Check Server Logs
Verify:
- No uncaught errors
- Database connections successful
- WebAuthn library initialized

## 6. Database Verification
```bash
# Check migrations applied
bun db:push

# Verify tables exist
# (Connect to PostgreSQL and list tables)
```
