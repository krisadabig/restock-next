---
description: Finish the current task and run governance checks.
---

# Finish Task Workflow

This workflow merges verification, governance checks, and git operations into a single command. It is the **ONLY** way to complete a task.

## Agent Procedure (Interactive UI)

1. **Verify First**:
   Run the checks *without* committing to validate the state.
   ```bash
   bun scripts/finish-task.ts --verify-only
   ```

2. **Create Verification Plan**:
   Create a temporary artifact (e.g., `verification_plan.md`) summarizing the changes and verification results. This is required to trigger the "Plan Approval" UI.

3. **Wait for Approval (The "Button")**:
   Call `notify_user` pointing to the artifact you just created.
   - **PathsToReview**: `['/absolute/path/to/verification_plan.md']`
   - **BlockedOnUser**: `true`
   - **Message**: "Verification passed. Please approve the plan to commit."

3. **Commit & Push**:
   Once the user approves (clicking the button), run the auto-commit command.
   ```bash
   bun scripts/finish-task.ts --auto-commit "type(scope): message"
   ```

## Manual Procedure (Terminal)

If the user is running this manually in their terminal:
```bash
bun scripts/finish-task.ts
```
(This will run interactively with Y/N prompts).

## Handling Failures

- **Verification Failed?** Fix the code/tests and re-run.
- **Governance Failed?** Update the required docs (`/handoff` workflow is helper).
- **Git Failed?** You may need to handle complex merge conflicts manually.

