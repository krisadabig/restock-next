# Backlog & Known Issues

This document tracks known issues, technical debt, and features deferred for future implementation.

## 🔴 Known Issues (Phase 18: Offline Mode)

### 1. Manual Add Entry 500 Error
- **Symptom**: Intermittent 500 error when manually adding entries in some environments
- **Suspected Cause**: RLS policy mismatch or dirty data state in Supabase
- **Workaround**: Automated tests pass; manual testing may require fresh DB state
- **Priority**: Medium
- **Logged**: 2026-01-23

### 2. Test Suite Hanging
- **Symptom**: `bun run test:unit` and `bun run smoke` commands hang indefinitely (30+ mins)
- **Suspected Cause**: Possible Vitest/Playwright process leak or async test not resolving
- **Workaround**: Manual `pkill -f vitest` to terminate; tests pass when run fresh
- **Priority**: High (affects DX)
- **Logged**: 2026-01-23

### 3. Theme Toggle Test Flakiness
- **Symptom**: `ThemeToggle.test.tsx` occasionally fails on theme persistence assertions
- **Suspected Cause**: localStorage mock timing in Vitest environment
- **Workaround**: Retry test run; usually passes on second attempt
- **Priority**: Low
- **Logged**: 2026-01-23

---

## 🟡 Technical Debt

### 1. Supabase Auth → Simple DB Auth Migration
- **Description**: Current auth uses Supabase email/password. Plan to migrate to simple username/password stored in local DB for offline-first approach.
- **Status**: Planned for Phase 19
- **Logged**: 2026-01-23

### 2. Passkey Enrollment Flow
- **Description**: WebAuthn passkey enrollment exists in Settings but is not fully tested E2E (requires virtual authenticator)
- **Status**: Deferred
- **Logged**: 2026-01-23

---

## 🟢 Feature Backlog

### Phase 19: Data Portability
- [ ] CSV Export for entries
- [ ] JSON Export for full data backup
- [ ] Web Share API for Trends page

### Phase 20: Advanced Features (Future)
- [ ] Push notifications for restock reminders
- [ ] Receipt photo attachment (camera integration)
- [ ] Multi-device sync conflict resolution UI

---

## 📝 Notes

- All automated tests (12/12 unit, 16/16 smoke) pass when run in clean state
- Core functionality (CRUD, Trends, Settings) works as expected
- Offline mode (IndexedDB) implemented but may need hardening for edge cases
