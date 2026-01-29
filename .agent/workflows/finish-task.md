---
description: Finish the current task and run governance checks.
---

# Finish Task Workflow

Follow these steps when you believe the task is complete (Code written, Tests passed).

1. **Execute Finish Script**:
   This script runs the "Hard Blocker" verification gate (Build, Lint, Test) and checks if you've updated the required documentation.
   ```bash
   # // turbo
   bun scripts/finish-task.ts
   ```

2. **Handle Failures**:
   - If the script fails (e.g., tests fail), **YOU CANNOT FINISH**. You must fix the errors and try again.
   - If it complains about `manifest.md` or `task.md` not being updated, update them!
   - If it complains about `retrospective.md`, create/update it.

3. **Git Operations (If Script Passed)**:
   The script will tell you what to do next if it passes (Commit, Push, PR). Follow its output instructions.
