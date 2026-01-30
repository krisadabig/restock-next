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

2. **Wait for Approval (The "Button")**:
   If verification passes, you MUST pause and ask the user for confirmation using `notify_user`.
   - **BlockedOnUser**: `true`
   - **Message**: "Verification passed. Modified files: [list files]. Ready to commit?"

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

