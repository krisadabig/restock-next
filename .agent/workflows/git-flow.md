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
# // turbo
git checkout -b feature/<task-name>
```

**Branch Naming Convention:**
- `feature/<task-name>` — New features (e.g., `feature/settings-page`)
- `fix/<issue>` — Bug fixes (e.g., `fix/theme-persistence`)
- `refactor/<area>` — Code refactoring (e.g., `refactor/auth-logic`)
- `docs/<topic>` — Documentation only (e.g., `docs/api-readme`)

## 2️⃣ During Development

### Run Tests BEFORE Every Commit

```bash
# // turbo
bun run smoke
```

**⚠️ NEVER commit if tests fail.** This ensures no bad code enters git history.

### Commit Per Phase/Feature
Organize commits by logical phases or features, not arbitrary checkpoints:

```bash
# Good: One commit per completed phase
git commit -m "feat(settings): implement settings page UI"
git commit -m "test(settings): add E2E tests for settings"
git commit -m "feat(settings): add persistence to localStorage"

# Bad: Committing incomplete or broken work
git commit -m "WIP: started settings"  # ❌ Never commit WIP
```

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
- [ ] All tests pass (`bun test`)
- [ ] New tests added for new behaviors
- [ ] No lint/type errors (`bun run lint` if available)
- [ ] Smoke tests pass (`bun run smoke`)
- [ ] UI verified via Playwright MCP (if applicable)
- [ ] Manifest updated with [COMPLETED] status

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
| Start | `git checkout -b feature/<name>` | Before ANY code changes |
| Save | `git commit -m "type(scope): msg"` | After each logical unit of work |
| Verify | `bun run smoke` | Before commits and merges |
| Finish | `git checkout main && git merge ...` | After ALL DoD criteria met |
| Clean | `git branch -d feature/<name>` | After successful merge |

## ⚠️ Rules

1. **Never commit directly to `main`** — Always use feature branches
2. **Never merge failing tests** — All tests must pass first
3. **Never skip smoke tests** — Run `bun run smoke` before merge
4. **Always update manifest** — Mark tasks [COMPLETED] with timestamp
