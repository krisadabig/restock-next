# Implementation Plan - Revamp App UI to New Design

Redesign the "Restock" app into a premium mobile-first PWA based on "Deep Glass" references. This involves a total overhaul of the design system, landing page, auth pages, dashboard, and modals using Tailwind 4 and Next.js 16.

## Proposed Changes

### [Component Name] Global Design System
#### [MODIFY] [globals.css](file:///Users/bigbigbig/personal/restock/restock-next/src/app/globals.css)
- Update Tailwind 4 color variables to match `#7f13ec` primary and `#121212` background.
- Implement "Deep Glass" utility classes (blur, borders, shadows).
- Enforce `Plus Jakarta Sans` as the primary font.

---

### [Component Name] Layout & Navigation
#### [MODIFY] [layout.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/app/app/layout.tsx)
- Apply `env(safe-area-inset-bottom)` for mobile readiness.
- Ensure View Transitions are enabled for page slides.

#### [MODIFY] [BottomNav.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/components/dashboard/BottomNav.tsx)
- Revamp with "Floating Glass" design.
- Re-center the "Add" button and use the new purple accent.
- Ensure 44px touch targets.

---

### [Component Name] Landing & Auth
#### [MODIFY] [page.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/app/page.tsx)
- Redesign Hero section with the new 3D-styled background and gradients.
- Update wording: "Master Your Kitchen".
- Implement the 4-card feature grid from references.

#### [MODIFY] [login/page.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/app/login/page.tsx)
- implement the new auth method selector (Password vs Passkey).
- Update background and glow effects.

---

### [Component Name] Dashboard & Modals
#### [MODIFY] [DashboardClient.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/components/dashboard/DashboardClient.tsx)
- Update card layout to match the new "Premium Dark" style.
- Ensure filters and search match the new field aesthetics.

#### [MODIFY] [AddEntryModal.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/components/dashboard/AddEntryModal.tsx)
- Redesign as a mobile-first Bottom Sheet.
- Integrate the Quantity (+/-) and Price inputs from references.
- Implement the "Pill Selector" for units.

---

### [Component Name] Settings
#### [MODIFY] [settings/page.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/app/app/settings/page.tsx)
- Redesign with the premium list appearance from references.
- Add user profile header.

## Verification Plan

### Automated Tests
- Run existing E2E tests: `bun test tests/e2e/`.
- Verify new UI elements via Playwright screenshots.

### Manual Verification
- Test "Thumb Zone" ergonomics on iPhone 15 viewport via Playwright.
- Verify "Deep Dark" aesthetic (OLED friendly).
- Check "Safe Area Insets" on simulated mobile devices.
