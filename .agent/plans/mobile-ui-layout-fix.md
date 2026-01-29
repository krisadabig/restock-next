# Implementation Plan: Mobile UI Layout Fix

## Goal
Fix the UI issue where buttons (specifically status and quantity badges in the entry list) overlap with other elements (likely the title or each other) on mobile devices.
Ensure this doesn't happen again by adding a visual validation step.

## User Review Required
> [!NOTE]
> The fix will involve changing the layout of the list items on mobile.
> Likely relocating badges below the title or allowing wrapping.

## Proposed Changes

### `src/components/dashboard`

#### [MODIFY] [DashboardClient.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/components/dashboard/DashboardClient.tsx)
- Modify the list item layout to handle long titles and badges gracefully on small screens.
- Use `flex-wrap` or change to `flex-col` for the title/badge container on mobile.
- Ensure touch targets remain accessible (44px rule where possible, though these are badges).

## Verification Plan

### Automated Tests
- Create a Playwright script `scripts/reproduce-overlap.ts` (using `playwright-skill` logic) to render the dashboard with mock data containing long names and badges.
- Isolate the list item component state and capture screenshots on mobile viewports (375x667, 390x844).

### Manual Verification
- Run `bun dev`.
- Open `http://localhost:3000/app` in a mobile simulator or resize browser.
- Verify that "In Stock" and Quantity badges do not overlap with the text or cut off.
