# Definition of Done

A task **MUST NOT** be marked [COMPLETED] unless **ALL** of the following are true:

## 1. Quality Assurance
- [ ] **Specs**: The feature/component is implemented according to the current requirements/spec.
- [ ] **Browsers**: You have **verified the feature works in the browser** (if it's a UI task).
- [ ] **Assets**: Verified no React hydration lints were introduced and all assets are correctly mapped to `public/`.
- [ ] **Responsive**: Verified layout works on Mobile (375px) and Desktop.

## 2. Automated Verification (The Gate)
You MUST run the `verify-task` script and it MUST pass:
- [ ] **Lint & Types**: No ESLint or TypeScript errors (`bun run lint`, `bun run build`).
- [ ] **Tests**: All existing tests pass (`bun test`).
- [ ] **New Tests**: New tests were added for main behaviors (coverage must not decrease).
- [ ] **Smoke Tests**: Critical paths pass (`bun run smoke`).

## 3. Workflow Compliance
- [ ] **Git Discipline**: All changes are committed to a `feature/` branch.
- [ ] **Branching**: Do NOT merge to `main` until verification passes.
- [ ] **Cleanup**: Delete the feature branch after merging.
- [ ] **i18n**: All text is wrapped in `t()` keys. New tests use regex locators for i18n (`/Settings|การตั้งค่า/`).

## 4. Final Handoff
- [ ] **Update Specs**: If the implementation deviated from the plan, update `spec.md`.
- [ ] **Status**: Update `task.md` and `manifest.md` with the verified timestamp.
