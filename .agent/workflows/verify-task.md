---
description: Run verification suite (Lint, Build, Test) to ensure quality.
---

# Verify Task Workflow

Run this workflow frequently during development, and ALWAYS before finishing a task.

1. **Execute Verify Script**:
   ```bash
   # // turbo
   bun scripts/verify-task.ts
   ```

2. **Fix Issues Immediately**:
   - if `lint` fails: Fix formatting/style issues.
   - if `build` fails: Fix TypeScript errors.
   - if `test` fails: Fix the logic or the test.
