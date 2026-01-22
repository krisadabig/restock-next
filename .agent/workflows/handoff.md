---
description: Mandatory steps to update the Session Handoff in manifest.md upon task completion
---

# Session Handoff Workflow

This workflow ensures that the `## Session Handoff / Next Steps` section in `.agent/manifest.md` is always accurate and provides a clear starting point for the next session or agent.

## 🕒 When to Run
Run this workflow **IMMEDIATELY AFTER** marking a task as `[COMPLETED]` in the `manifest.md` and **BEFORE** merging the feature branch to `main`.

## 📋 Steps

### 1. Review Current State
Examine the `manifest.md` and `task.md` to summarize what has actually been accomplished. 

### 2. Update `Current State`
Update the `Current State` bullet points in the `Session Handoff / Next Steps` section of `manifest.md`. 
- Be specific (e.g., "Supabase Auth integrated" instead of "Auth done").
- Mention specific files or APIs changed if critical.
- Ensure it reflects the absolute truth of the codebase *right now*.

### 3. Update Application Spec
Check if the changes merit an update to `.agent/spec.md`. If you added a new route, a new table, or a new dependency, it MUST be documented there.

### 4. Update `Immediate Next Actions`
Define the next 3-4 logical steps. 
- Use a numbered list.
- Reference existing tasks in `task.md` or new ones discovered during development.
- Mark completed items with ~~strikethrough~~ and ✅ if they were just finished but were previously listed.

### 4. Cross-Reference `task.md`
Ensure that any new "Next Steps" identified are also reflected as `[ ] Todo` items in the `task.md` file.

## ⚠️ Checklist for Commit
Include the following in your final merge commit message or as a separate commit:
- "docs(handoff): update session handoff in manifest.md"

## 💎 Example Format
```markdown
## Session Handoff / Next Steps
**Current State**:
- Settings page fully implemented with theme/lang persistence.
- E2E tests for settings passing (14/14 total).
- Supabase Auth integration started (packages installed).

**Immediate Next Actions**:
1. Finish Supabase Auth implementation (sync users table).
2. Implement Trends page visualization.
3. Audit UI consistency across all pages.
```
