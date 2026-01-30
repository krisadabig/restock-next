---
description: Finish the current task and run governance checks.
---

# Finish Task Workflow

This workflow merges verification, governance checks, and git operations into a single command. It is the **ONLY** way to complete a task.

## Steps

1. **Run the Script**:
   ```bash
   # // turbo
   bun scripts/finish-task.ts
   ```

2. **Automated Checks**:
   - **Verification**: Runs `scripts/verify-task.ts` (Build, Lint, Test).
   - **Governance**: Checks if `manifest.md`, `task.md`, and `retrospective.md` are updated.
   - **Smart Reminders**: Scans changed files and reminds you of specific context checks (e.g., "Check Mobile Responsiveness" if UI changed).

3. **Interactive Git Flow**:
   - The script will show you the modified files.
   - It will ask for a **Conventional Commit** message.
   - It will automatically stage (`git add .`), commit, and push.
   - It prints a link to create a PR.

## Handling Failures

- **Verification Failed?** Fix the code/tests and re-run.
- **Governance Failed?** Update the required docs (`/handoff` workflow is helper).
- **Git Failed?** You may need to handle complex merge conflicts manually.

