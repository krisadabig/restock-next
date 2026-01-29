# Implementation Plan - Fix Dark Theme Palette

## Goal
Fix readable text color failures in Dark Mode, specifically regarding Primary and Destructive colors which currently fail WCAG AA on dark card backgrounds.

## User Review Required
- [ ] Visual check of Primary and Destructive buttons/text in Dark Mode.

## Proposed Changes
### Design System
#### [MODIFY] [globals.css](file:///Users/bigbigbig/personal/restock/restock-next/src/app/globals.css)
- [ ] Change Dark Mode `primary` from Indigo 500 (#6366f1) to Indigo 400 (#818cf8).
- [ ] Change Dark Mode `destructive` from Red 500 (#ef4444) to Red 400 (#f87171).
- [ ] Update `ring` to match new `primary`.

## Verification Plan
### Automated Tests
- [ ] `next build` (Standard verify)

### Manual Verification
- [ ] Browser Subagent visual audit of:
    - [ ] Settings Page (Theme Toggle active state, Delete button)
    - [ ] Login Page (Primary buttons)
