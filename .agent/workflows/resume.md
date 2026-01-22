---
description: Workflow to quickly pick up from where the last session left off
---

# Resume Session Workflow

This workflow is triggered when an agent starts a new session or is asked to "continue" or "resume". It ensures the agent has the correct context before suggesting or starting work.

## 🕒 When to Run
- At the start of every new session.
- When the user says "continue", "resume", or "what's next?".

## 📋 Steps

### 1. Read Project Manifest & Spec
- **Action**: `view_file` on `.agent/manifest.md` and `.agent/spec.md`.
- **Goal**: Understand the high-level status, tech stack, and core application logic.

### 2. Read Task Checklist
- **Action**: `view_file` on `.agent/task.md`.
- **Goal**: Identify which specific items are `[x]` (completed), `[/]` (in-progress), and `[ ]` (todo).

### 3. Check Git Environment
- **Action**: `run_command` with `git status` and `git branch`.
- **Goal**: Verify if there is an active feature branch and if there are any uncommitted changes.

### 4. Branch Locking (MANDATORY)
- **Action**: Check if current branch is `main`. If so, identify the next task and propose a specific branch name (e.g., `feature/trends-page`).
- **Rule**: You MUST execute `git checkout -b <branch-name>` before the first `write_to_file` call of the session.
- **Goal**: Prevent accidental development on the `main` branch.

### 5. Synchronize & Propose
- **Action**: Summarize the current state to the user in the Task View.
- **Goal**: Confirm the "Next Immediate Action" based on the handoff, state the active branch, and ask for permission to proceed.

## 💎 Example Response
"I've resumed the session. Based on the manifest handoff and task list:
- **Current State**: Supabase Auth is integrated, but RLS needs verification.
- **Active Branch**: `main` (clean).
- **Proposed Next Step**: Verify Supabase RLS policies.

Shall I proceed with this?"
