# Implementation Plan - Audit and Prioritize Features

## Goal
Analyze the current `restock-next` codebase to identify essential features, address technical debt, and prioritize outstanding tasks from the backlog. Provide a clear roadmap for the next development phase.

## Current State Analysis
- **Authentication**: Fully migrated to custom DB Auth + WebAuthn. Supabase references are now legacy.
- **Core CRUD**: Functional with optimistic UI and IndexedDB sync.
- **Trends**: Basic metrics visualization implemented.
- **Testing**: Passing with decent coverage, but DX is hampered by process hangs.

## Proposed Priority List

### 1. [High] Core Inventory System & SDD Workflow
- **Goal**: Implement stateful tracking and formalize development process.
- **Tasks**:
    - [x] Update `.agent/spec.md` with inventory schema.
    - [x] Integrate "Spec Check" in `start-task.ts`.
    - [x] Implement inventory table and auto-sync in `actions.ts`.
    - [x] Create `TimelineModal` for item history.
    - [x] Add stock status badges to `DashboardClient`.
    - [x] Fix test runner hangs (Unit/Smoke).
    - [x] Ensure 100% mocked unit tests.

### 2. [Medium] Data Portability (Export Features)
- **Goal**: Allow users to backup and move their data.
- **Tasks**:
    - Add "Export Data" section in Settings.
    - Implement CSV Export (using `papaparse` or similar).
    - Implement JSON Export (full backup).

### 3. [Medium] Trends Sharing (Web Share API)
- **Goal**: Increase utility of the Trends page.
- **Tasks**:
    - Implement a "Share Summary" button.
    - Use Web Share API to send text summary or screenshot (if possible) of spending.

### 4. [Low] Passkey E2E Testing
- **Goal**: Remove "Deferred" status from WebAuthn testing.
- **Tasks**:
    - Implement virtual authenticator setup in Playwright.
    - Formalize E2E tests for registration and usernameless login.

### 5. [Low] Receipt Photo Attachment
- **Goal**: Premium feature for record keeping.
- **Tasks**:
    - Integrate camera/file upload for entries.
    - Consider blob storage (Local or S3-compatible).

## Verification Plan

### Automated Tests
- `bun scripts/verify-task.ts` (Ensures no regressions during audit-related fixes).

### Manual Verification
- Review task list with user to finalize the order of implementation.
