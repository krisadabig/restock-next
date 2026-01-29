# Implementation Plan - Inventory Quantity Management & App-like UX

## Goal
Implement physical stock level tracking (Quantity/Unit) and revamp the Dashboard UX to feel like a high-end native mobile application.

## Proposed Changes

### [Component] Inventory Backend & Schemas
- **[MODIFY] [src/app/app/actions.ts](file:///Users/bigbigbig/personal/restock/restock-next/src/app/app/actions.ts)**
    - Enhance `addEntry` to accept `quantity` and `unit` and sync them to the `inventory` table.
    - Update `updateInventory` to handle validation for quantity types.
- **[MODIFY] [src/lib/db/schema.ts](file:///Users/bigbigbig/personal/restock/restock-next/src/lib/db/schema.ts)**
    - (Already has quantity/unit, but ensuring types are correctly utilized in actions).

### [Component] UI: Manage Inventory Flow
- **[NEW] [src/components/dashboard/ManageInventoryModal.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/components/dashboard/ManageInventoryModal.tsx)**
    - A dedicated modal to edit quantity, unit, and alert status for an item.
- **[MODIFY] [src/components/dashboard/AddEntryModal.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/components/dashboard/AddEntryModal.tsx)**
    - Add `quantity` and `unit` inputs to the "Add Entry" flow.

### [Component] PWA & Hydration Fix
- **[MODIFY] [public/sw.js](file:///Users/bigbigbig/personal/restock/restock-next/public/sw.js)**
    - Change strategy for navigation requests from Cache-First to **Network-First** to ensure fresh data when online.
- **[MODIFY] [src/components/dashboard/DashboardClient.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/components/dashboard/DashboardClient.tsx)**
    - Add a "stale data check" in `useEffect`. If `initialEntries` is stale/empty and online, trigger a server-side revalidation or client-side fetch.

### [Component] App-like UX Revamp
- **[MODIFY] [src/components/dashboard/DashboardClient.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/components/dashboard/DashboardClient.tsx)**
    - Implement "Lazy Loading" for modals (rendered only when needed).
    - Refactor list items to show quantity/unit next to the item name.
    - Enhance "Bottom Toolbar" or navigation interactions to match PWA standards (Thumb Zone).
- **[MODIFY] [src/app/layout.tsx](file:///Users/bigbigbig/personal/restock/restock-next/src/app/layout.tsx)**
    - Ensure safe-area-insets are applied via standard CSS variables.

## Verification Plan

### Automated Tests
- **Unit Tests**:
    - `tests/inventory-quantity.test.ts`: Verify `addEntry` correctly updates inventory quantity.
    - `tests/inventory-actions.test.ts`: Test `updateInventory` with various unit types.
- **E2E Tests**:
    - `tests/e2e/inventory-management.spec.ts`: Verify the new "Manage Inventory" modal works.
    - `tests/e2e/ux-performance.spec.ts`: Check for lazy-loading behavior of modals.

### Manual Verification
- Verify the "app-like" feel on mobile viewport (iPhone 16 Pro).
- Check smooth transitions between the dashboard and inventory management views.
