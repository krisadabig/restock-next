---
description: Standards for maintaining markdown files (logs, lists, tasks)
---

# Markdown Maintenance Standards

To ensure our documentation remains legible and professional, strict adherence to these rules is required when updating ANY markdown file (especially `task.md`, `manifest.md`, `retrospective.md`, and plan files).

## 1. Append, Do Not Insert
When adding new entries to a list or log:
- **ALWAYS** append to the *end* of the relevant section or list.
- **NEVER** insert new items in the middle of a list unless specifically reordering for logic.
- **NEVER** insert at the top of a chronological log (unless the file explicitly uses reverse-chronological order, but `task.md` and `manifest.md` usually do not).

**Bad:**
```markdown
- [ ] Task A
- [ ] NEW TASK
- [ ] Task B
```

**Good:**
```markdown
- [ ] Task A
- [ ] Task B
- [ ] NEW TASK
```

## 2. Chronological Integrity
- Respect the timeline. If you did X, then Y, the log must read X, then Y.
- When updating `Verification Log` or `Change Log`, always add the new entry at the bottom.

## 3. Visual Cleanliness
- **Spacing**: Ensure there is exactly one newline between list items if they are multi-line.
- **Indentation**: Respect the existing indentation level (usually 2 spaces or 4 spaces). Do not mix tabs and spaces.
- **Headers**: Leave one blank line before and after headers.

## 4. No "Messy" Updates
- Do not leave "orphan" bullet points or broken formatting.
- If you delete an item, ensure you don't leave a double newline gap.
- "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." - Keep updates surgical and precise.

## 5. Artifact Updates
- When updating `task.md` status (e.g., `[ ]` to `[x]`), do ONLY that. Do not reformat the rest of the file unnecessarily.
