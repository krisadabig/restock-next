# Rule: Spec-Driven Development (SDD) + TDD

## Overview
This project follows a strict **Spec-Driven** and **Test-Driven** development cycle. The goal is to ensure that the code exactly matches the intent and that no logic is implemented without a prior specification and a corresponding test.

## The Cycle

1.  **Spec First (SDD)**: Before any implementation, update `.agent/spec.md` (and any related feature specs) to reflect the desired behavior.
2.  **TDD RED**: Write unit tests (`Vitest`) or E2E tests (`Playwright`) that verify the new specification. These tests MUST fail initially.
3.  **TDD GREEN**: Write the minimal code necessary to make the tests pass.
4.  **REFACTOR**: Clean up the code while ensuring tests remain green.
5.  **Verify**: Run the full verification suite (`bun scripts/verify-task.ts`).

## Governance Gates

- `scripts/start-task.ts` will remind you to check the spec.
- `scripts/finish-task.ts` will verify:
    - `retrospective.md` includes **Preventive Measures**.
    - `spec.md` was updated if `src/` logic was touched.
    - All tests pass (via `verify-task.ts`).

## Best Practices
- Keep `.agent/spec.md` concise but technically accurate.
- Use `useOptimistic` for UI changes to maintain "Speed and Simplicity".
- Never skip the RED phase; a test that passes immediately is a bug in the test or a redundant test.
