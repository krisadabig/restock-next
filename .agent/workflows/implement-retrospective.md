---
description: Operationalize lessons from the retrospective into rules or skills.
---

# Implement Retrospective Workflow

This workflow ensures that **Lessons Learned** don't just sit in a log file—they become part of the system. It helps you turn retrospective items into:
1.  **Rules**: Global behavioral constraints.
2.  **Skills**: Technical capabilities or instructions.
3.  **Checklists**: Verification steps.

## When to use

- After writing a Retrospective log (usually at the end of a session).
- When starting a session, to ensure previous lessons are applied.

## Usage

```bash
# // turbo
bun scripts/implement-retrospective.ts
```

## Process

1.  The script reads the **Latest Session** from `.agent/retrospective.md`.
2.  It lists "Lessons Learned" and "Preventive Measures".
3.  You select **one item** to operationalize.
4.  You choose the **Mechanism** (Rule, Skill, Checklist).
5.  The system creates/updates the file for you.

## Goal

Create a **Closed Loop System** where every mistake leads to a permanent system upgrade.
