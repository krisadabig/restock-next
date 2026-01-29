---
description: Mandatory Git workflow for all AI agents before/during/after feature development
---

# Git Flow Workflow

This workflow is **MANDATORY** for all AI agents working on this project. Follow these steps for every feature or task.

## 🚦 Pre-Flight Checks

Before starting ANY new feature:

```bash
# // turbo
git status
```

Ensure working directory is clean. If there are uncommitted changes, commit or stash them first.

## 1️⃣ Branch Creation (BEFORE Starting Work)

```bash
# Recommendation: Use the workflow
# /start-task

# Or manual equivalent:
# // turbo
git checkout -b feature/<task-name>
```

**Branch Naming Convention:**
- `feature/<task-name>` — New features (e.g., `feature/settings-page`)
- `fix/<issue>` — Bug fixes (e.g., `fix/theme-persistence`)
- `refactor/<area>` — Code refactoring (e.g., `refactor/auth-logic`)
- `docs/<topic>` — Documentation only (e.g., `docs/api-readme`)

## 2️⃣ During Development

### Proactive Linting
Run linting frequently during development to catch errors early:

```bash
# Recommendation: Use the workflow
# /verify-task

# Or manual equivalent:
# // turbo
bun run lint
```

**⚠️ NEVER commit if tests or linting fail.** This ensures no bad code enters git history.

### Commit Per Phase/Feature
Organize commits by logical phases or features, not arbitrary checkpoints:

```bash
# Good: One commit per completed phase
git commit -m "feat(settings): implement settings page UI"
git commit -m "test(settings): add E2E tests for settings"
```

**⚠️ Synchronize Spec BEFORE Commit**:
For every `feat` or `refactor` commit, you MUST first verify that `.agent/spec.md` accurately describes the new/changed logic (routes, data flow, deps).

### Conventional Commits Format
Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]
```

**Types:** `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`

## 3️⃣ Pre-Merge Checklist

Before merging to `main`, verify ALL Definition of Done criteria (see `manifest.md`):

- [ ] Feature implemented per spec
- [ ] **Visual Audit & Ergonomic Check**: Verified UI matches `/design-references` and passes "Thumb Zone" check (see `.agent/skills/visual-audit/SKILL.md`).
- [ ] **Component Directive Check**: Verified `'use client';` presence in all modified Client Components.
- [ ] No lint/type errors (`bun run lint`).
- [ ] **Build Check**: Verified `bun run build` passes locally.
- [ ] All tests pass (`bun test`).
- [ ] New tests added for new behaviors
- [ ] Smoke tests pass (`bun run smoke`)
- [ ] UI verified via Playwright MCP (if applicable)
- [ ] Manifest updated with [COMPLETED] status
- [ ] **Application Spec (`.agent/spec.md`) updated to reflect changes**
- [ ] **Session Handoff updated in `manifest.md` (see `/handoff` workflow)**

## 4️⃣ Merge to Main

```bash
# Switch to main
git checkout main

# Merge feature branch (fast-forward preferred)
git merge feature/<task-name>

# Or use squash merge for cleaner history
git merge --squash feature/<task-name>
git commit -m "feat(<scope>): <summary of feature>"
```

## 5️⃣ Cleanup

```bash
# Delete the feature branch
# // turbo
git branch -d feature/<task-name>

# Push to remote (if configured)
git push origin main
```

## 📋 Quick Reference

| Phase | Command | When |
|-------|---------|------|
| Start | `/start-task` OR `git checkout ...` | Before ANY code changes |
| Save | `git commit -m "type(scope): msg"` | After each logical unit of work |
| Verify | `/verify-task` OR `bun run smoke` | Before commits and merges |
| Finish | `/finish-task` OR `git checkout main ...` | After ALL DoD criteria met |
| Clean | `git branch -d feature/<name>` | After successful merge |

## ⚠️ Rules

1. **Never commit directly to `main`** — Always use feature branches.
2. **Never merge failing tests** — All tests must pass first (`bun run smoke`).
3. **Spec Syncing is Mandatory** — Update `.agent/spec.md` concurrently with feature implementation.
4. **Always update manifest** — Mark tasks [COMPLETED] and **update Handoff session**.
5. **Continuous Verification** — Run `bun test && bun run lint` before every commit to ensure quality.
6. **Production Build Check** — Run `bun run build` before verification to catch type/build errors missed by dev server.
