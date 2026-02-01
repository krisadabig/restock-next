---
description: This workflow merges verification, governance checks, and git operations
---

# Finish Task Workflow

This workflow merges verification, governance checks, and git operations.

## 🤖 Agent Procedure (MANDATORY)

Agents **MUST** follow this exact sequence. Do **NOT** use the interactive mode.

1.  **Verify First**:
    Run checks without committing.
    ```bash
    bun scripts/finish-task.ts --verify-only
    ```

2.  **Create Verification Plan**:
    Create `verification_plan.md` (ArtifactType: `implementation_plan`) with:
    - Summary of changes
    - Verification evidence (screenshots, test results)
    - Manual protocols verified (if any)

3.  **Request Approval (The "Proceed" Button)**:
    Call `notify_user` with:
    - `PathsToReview`: `['/absolute/path/to/verification_plan.md']`
    - `BlockedOnUser`: `true`
    - `ShouldAutoProceed`: `true` (Triggers the UI Button)
    - `Message`: "Verification passed. Click Proceed to commit."

4.  **Commit & Push**:
    **ONLY** after the user clicks "Proceed" (or says "yes"), run:
    ```bash
    bun scripts/finish-task.ts --auto-commit "type(scope): message"
    ```

## 👤 Manual Procedure (Humans Only)

Humans can run the interactive script directly:
```bash
bun scripts/finish-task.ts
```

## ❌ Agent Red Lines
- **NEVER** run `bun scripts/finish-task.ts` interactively.
- **NEVER** use `send_command_input` to bypass the prompt.
- **ALWAYS** create a Verification Plan artifact before committing.

