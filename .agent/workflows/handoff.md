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

### 3. Conduct Retrospective & Update Rules
- **Action**: Create or update `retrospective.md` covering:
    - What went well?
    - What were the friction points?
- **CRITICAL**: If a mistake was made (e.g., missing `'use client'`, lint errors), you MUST update the relevant project workflow (e.g., `git-flow.md`) or rule file to prevent it from happening again.

### 3. Update Application Spec
Check if the changes merit an update to `.agent/spec.md`. If you added a new route, a new table, or a new dependency, it MUST be documented there.

### 4. Update `Immediate Next Actions`
Define the next 3-4 logical steps. 
- Use a numbered list.
- Reference existing tasks in `task.md` or new ones discovered during development.
- Mark completed items with ~~strikethrough~~ and ✅ if they were just finished but were previously listed.

### 4. Cross-Reference `task.md`
Ensure that any new "Next Steps" identified are also reflected as `[ ] Todo` items in the `task.md` file.

### 5. Conduct Retrospective (Closing the Loop)
- **Action**: Create a `retrospective.md` artifact (or add to an existing one in the brain directory) covering:
    - What went well?
    - What were the friction points?
    - How can we update the rules or workflows to prevent those friction points?
    
- **Mandatory Backlog Conversion**:
    - Any friction point that requires a process change or code fix **MUST** be added to `manifest.md`'s "Immediate Next Actions" as a formal task.
    - **Severity Tagging**: Use these tags for prioritization:
        - **[SEV1]**: Production Blocker / Governance Violation (Fix Immediately)
        - **[SEV2]**: Feature Blocker / High Friction (Fix in next session)
        - **[SEV3]**: Optimization / Nice to have (Backlog)

- **Goal**: Turn active mistakes into passive guardrails.

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
