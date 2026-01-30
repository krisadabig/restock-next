# Implementation Plan: Stock Tracking Feature

## Goal
Implement a dedicated **Stock Tracking** feature to allow users to view their current inventory, adjust stock levels (consume/restock), and manage item details (alerts, units) from a central interface.

## User Review Required

> [!IMPORTANT]
> **Consumption Logic**
> We will add a "Consume" action (via `-` button) that decrements stock *without* recording a meaningful "Purchase" entry with negative price. This isolates "Usage" from "Spending". Is this the desired behavior?

> [!NOTE]
> **Navigation**
> We will add a new "Inventory" icon to the bottom navigation bar for quick access.

## Proposed Changes

### Database
*   **[NO CHANGE]**: The `inventory` table already exists and supports `quantity`, `unit`, `status`, and `alertEnabled`.

### Backend (Server Actions)
*   **[NEW] `src/app/app/actions.ts`**:
    *   `consumeItem` action: Decrements inventory quantity.
    *   `restockItem` action (Quick): Increments inventory quantity without price (for corrections or free items).
*   **[MODIFY] `src/app/app/actions.ts`**:
    *   Update `addEntry` to ensure it robustly syncs with inventory (already implemented, will verify unit consistency).

### Frontend (UI/UX)
*   **[NEW] `src/app/app/inventory/page.tsx`**:
    *   **Header**: Title "Inventory" + Search Bar.
    *   **List**: Grid/List of `InventoryCard` components.
    *   **Empty State**: "No items in stock".
*   **[NEW] `src/components/inventory/InventoryCard.tsx`**:
    *   Displays: Item Name, Quantity, Unit, Status Badge (In Stock / Low / Out).
    *   Actions: `+` and `-` buttons for quick adjustment.
    *   Clicking body opens existing `ManageInventoryModal`.
*   **[MODIFY] `src/components/dashboard/BottomNav.tsx`**:
    *   Add "Inventory" link (using `Package` or `Box` icon).

## Verification Plan

### Automated Tests (Playwright)
*   **[NEW] `tests/e2e/inventory.spec.ts`**:
    1.  **Navigate**: Login -> Click "Inventory" tab.
    2.  **Verify List**: Ensure items added via "Add Entry" appear here.
    3.  **Quick Action**: Click `+` on an item. Reload page. Verify quantity increased.
    4.  **Quick Action**: Click `-` on an item. Verify quantity decreased.
    5.  **Search**: Type item name -> Verify list filters correctly.

### Manual Verification
1.  **Sync Check**: Add an item "Test Milk" via standard "Add" button.
2.  **Inventory Check**: Go to Inventory tab. "Test Milk" should be there.
3.  **Consumption**: Click `-` on "Test Milk".
4.  **Persistence**: Reload page. Quantity should remain decremented.
