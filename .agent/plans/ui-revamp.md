# Implementation Plan: Ultimate UI Revamp

## Goal
Transform "Restock" into a world-class, premium PWA with a "wow" factor.
Fix existing mobile layout bugs as part of a broader ergonomic and aesthetic overhaul.

## Design Vision: "Deep Glass & Neon"
- **Background**: Deepest slate (`#020617`) or pure black for OLED, but with subtle localized gradients (aurora effects).
- **Surface**: Glassmorphism (blur + transparency) for cards and modals.
- **Typography**: "Inter" or "Outfit" with tight tracking for headings, high readability for data.
- **Micro-interactions**: Every click has tactile feedback (scale, ripple).
- **Transitions**: View Transitions API for native-like page navigation.

## User Review Required
> [!IMPORTANT]
> This is a major visual change.
> We will verify every screen for mobile responsiveness.

## Proposed Changes

### 1. Design System Core
#### [MODIFY] [globals.css](file:///Users/bigbigbig/personal/restock/restock-next/src/app/globals.css)
- Define new CSS variables for "Premium Dark" palette.
- Add utility classes for `.glass-panel`, `.text-gradient`, `.btn-primary-glow`.
- Import premium font (e.g., 'Outfit' or 'Inter') via `next/font`.

### 2. Component Redesign
#### [MODIFY] [DashboardClient.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/components/dashboard/DashboardClient.tsx)
- **Item List**: Redesign list items to use a "Separated Card" layout rather than a table row style.
    - Fix the mobile overlap bug by moving badges to a dedicated bottom row within the card.
    - Add swipe actions (optional) or clear thumb-friendly buttons.
- **Header**: Make it sticky with a blur backdrop.

#### [MODIFY] [BottomNav.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/components/dashboard/BottomNav.tsx)
- Add a "float" effect.
- Enhance active state animations (glow/scale).

### 3. Page Overhauls
#### [MODIFY] [Login Page](file:///Users/bigbigbig/personal/restock/restock-next/src/app/login/page.tsx)
- Add a dynamic background (animated gradient or particle effect).
- Centered glass card for the form.

#### [MODIFY] [Settings Page](file:///Users/bigbigbig/personal/restock/restock-next/src/app/app/settings/page.tsx)
- Group settings into "Island" sections.

## Verification Plan

### Automated
- **Playwright**: Update visual snapshots (if visual regression testing is active, otherwise rely on manual).
- **Responsiveness**: Verify "Thumb Zone" usage on mobile viewports.

### Manual
- **Aesthetics**: Does it feel "premium"? (Subjective check against design aptitude).
- **Bug Fix**: Confirm badges no longer overlap on mobile.
