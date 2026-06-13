# Restock — Product & UX Spec

> **Source**: Derived from business team user journey sessions, Jun 2026.
> **Boundary**: In-house family (couple) stock tracking only.
> **Status**: Finalized for implementation handoff.

---

## 1. Product Context

### What This App Is

A household price memory + stock awareness tool for a couple.
Not a consumption tracker. Not a shopping app. Not a recipe tool.

**The value loop:**
```
See item on sale
→ Check app: "What did I last pay? How many do I still have?"
→ Decide: stock up or skip
→ Log the purchase with price
→ History grows → future decisions get smarter
```

**The one emotional promise:**
> "You will never open a cabinet and find it empty and think 'why didn't anyone tell me?'"

### What This App Is Not

- No consumption rate calculation
- No run-out date prediction
- No barcode scanning
- No recipe integration
- No price comparison to external stores
- No social sharing outside the household

---

## 2. Users

**Household**: A couple. Two people, one shared inventory.
**Behavior**: Either person can log any action at any time. No roles.
**Logging baseline**: Zero prior data — this is a greenfield install.
**Shopping pattern**: Buy when on sale, often stock up (multiple units per purchase).
**Stores**: Primarily CJ and Big C (free-text store field, not an enum).
**Device**: Mobile-first PWA. Desktop secondary.

### Personas

| | Alex | Sam |
|---|---|---|
| Behavior | Does most shopping, buys in bulk on sale | More often at home, notices when things run low |
| Pain today | Buys something already stocked | Opens cabinet, item is gone |
| Device habit | Checks phone at the store | Checks phone casually at home |

> Alex and Sam are interchangeable — any day either person can be in either role.

### Core Problem

> Two people share one pantry but maintain two separate mental models of it.

---

## 3. Data Model

### Schema

```ts
categories {
  id, name, unit, userId, createdAt
}
// e.g. name: "Fabric Softener", unit: "bottle"
// e.g. name: "Meat", unit: "pack"

items {
  id, categoryId, name, userId, createdAt
}
// e.g. name: "Downy 1L Lavender"
// e.g. name: "Chicken Breast 500g"
// Item name carries all variant info — no separate brand/size/scent fields

entries {
  id, itemId, type: 'purchase' | 'consume',
  price, quantity, unit, store, date, note,
  userId, createdAt
}
// store: free text — "Big C", "CJ", etc.
// price: per unit (not total)
```

### Hierarchy

```
Category  →  Item  →  Entry
(grouping)   (specific variant)  (event with price/qty/store/date)
```

**Examples:**

| Category | Item | Entry |
|---|---|---|
| Fabric Softener | Downy 1L Lavender | ฿89 · 2 bottles · Big C · Jun 10 |
| Fabric Softener | Comfort 750ml Fresh | ฿65 · 1 bottle · CJ · May 3 |
| Meat | Chicken Breast 500g | ฿52 · 3 packs · Big C · Jun 11 |
| Rice | Jasmine Rice 5kg | ฿189 · 1 bag · Big C · May 20 |

**Rule**: Item name is as specific as the user needs. "Chicken Breast 500g" needs no brand field — the name is the variant. This model generalizes to any item type.

### Analytics Normalization

Per-unit price comparison (e.g. ฿/ml, ฿/g) is shown at category level only when all items share the same base unit type. Mixed units → skip normalization, show absolute price only.

---

## 4. Feature Priority

| Priority | Feature |
|---|---|
| 1 | Fast purchase logging with price + store |
| 2 | Current stock count per item |
| 3 | Price history per item and category |
| 4 | Shared inventory (couple sees same state) |
| 5 | Category > Item > Entry variant model |
| 6 | Activity feed (who logged what, when) |
| 7 | Low stock alert (threshold-based, no prediction) |
| — | ~~Consumption rate / run-out prediction~~ — removed |

---

## 5. Navigation Structure

```
Bottom Bar (3 tabs)        Persistent FAB
┌──────────────────────┐   ╋ (bottom-right, always visible)
│ Stock │ Price │  ⚙  │   Opens Log Entry bottom sheet
└──────────────────────┘
```

- **Stock** — current inventory state
- **Price** — analytics and price history (named for what it does, not "Analytics")
- **Settings** — household, categories, stores
- **FAB** — floating, available on all tabs

---

## 6. Screen Specs

---

### Screen 1: Stock

**Purpose**: Answer "what do I have right now?"

**Layout:**
```
┌────────────────────────────────┐
│ Restock          [Search] [⚙] │
├────────────────────────────────┤
│ 🔴 Out of Stock  (2 items)    │  ← collapsed, tap to expand
│ 🟡 Low Stock     (1 item)     │  ← collapsed, tap to expand
├────────────────────────────────┤
│ FABRIC SOFTENER                │  ← category group header
│ ┌──────────────────────────┐  │
│ │ Downy 1L Lavender        │  │
│ │ 2 bottles  •  last: ฿89  │  │
│ │ Big C · Jun 10           │  │
│ └──────────────────────────┘  │
│ ┌──────────────────────────┐  │
│ │ Comfort 750ml Fresh      │  │
│ │ 0 bottles  🔴 out        │  │
│ │ CJ · May 3               │  │
│ └──────────────────────────┘  │
│                                │
│ MEAT                           │
│ ┌──────────────────────────┐  │
│ │ Chicken Breast 500g      │  │
│ │ 3 packs  •  last: ฿52   │  │
│ │ Big C · Jun 11           │  │
│ └──────────────────────────┘  │
│                          ╋   │
└────────────────────────────────┘
```

**Item Card contents:**
- Item name (bold)
- Current quantity + unit
- Stock status dot: green (in stock) · amber (low, user-set threshold) · red (zero)
- Last price paid + store + date — the quick deal-check reference
- Tap → Item Detail

**Sort/Filter bar** (horizontal scrollable chips below header):
`All` `Out of Stock` `Low` `A–Z` `Recent`

**Empty state**: "Nothing logged yet. Tap ╋ to add your first item."

---

### Screen 2: Item Detail

**Purpose**: Full picture of one item — stock, price intelligence, every entry.

**Entry point**: Tap any item card from Stock screen.

**Layout:**
```
┌────────────────────────────────┐
│ ←  Downy 1L Lavender     [✏] │
│     Fabric Softener            │  ← category label, tappable
├────────────────────────────────┤
│  CURRENT STOCK                 │
│  ┌──────┐  ┌────────┐         │
│  │  2   │  │bottles │         │
│  └──────┘  └────────┘         │
│  [+ Purchase]  [− Consume]     │
├────────────────────────────────┤
│  PRICE INTELLIGENCE            │
│  Your avg     ฿105             │
│  Best ever    ฿79  (Big C·Mar) │
│  Last paid    ฿89  (Big C·Jun) │
│                                │
│  ฿89 is 15% below your avg ✓  │  ← deal signal
│                                │
│  Big C  avg ฿91                │
│  CJ     avg ฿112               │  ← store comparison
├────────────────────────────────┤
│  HISTORY           [All ▾]     │  ← filter: All / Purchase / Consume
│                                │
│  Jun 10  🛒 2 bottles  ฿89    │
│           Big C            [✏]│
│                                │
│  May 3   🛒 1 bottle   ฿99    │
│           CJ               [✏]│
│                                │
│  Apr 15  📦 1 bottle used      │
│                                │
│  Mar 2   🛒 3 bottles  ฿79    │
│           Big C  🏷️ sale   [✏]│
│                          ╋   │
└────────────────────────────────┘
```

**Price Intelligence rules:**
- Deal signal shown when last-paid is below average price
- Best-ever highlighted if last-paid is within 10% of it
- Store comparison shown only if item logged at 2+ stores
- Empty state: "Log 2+ purchases to see price insights."

**History entry row:**
- Icon: 🛒 purchase · 📦 consume
- Quantity delta
- Price + store (purchase only)
- Note (if exists, shown below in grey)
- 🏷️ sale flag if price is >15% below average for that item
- [✏] edit icon on right → Edit Entry Sheet

**[✏] on header** → Edit Item Sheet

---

### Screen 3: Category View

**Purpose**: Compare all items in a category side by side.

**Entry point**: Tap category label on Item Detail header.

**Layout:**
```
┌────────────────────────────────┐
│ ←  Fabric Softener             │
├────────────────────────────────┤
│  ITEMS IN THIS CATEGORY        │
│                                │
│  Item              Avg   Best  │
│  ────────────────────────────  │
│  Downy 1L Lavender ฿105  ฿79  │  ← tap → Item Detail
│  Comfort 750ml     ฿68   ฿55  │
│  Snuggle 1.5L      ฿145  ฿120 │
│                                │
│  Per-unit cheapest:            │
│  Comfort 750ml — ฿0.09/ml ✓   │  ← only shown if units are comparable
├────────────────────────────────┤
│  TOTAL SPEND                   │
│  This month    ฿89             │
│  Last month    ฿99             │
│  This year     ฿620            │
├────────────────────────────────┤
│  SPEND OVER TIME               │
│  [monthly bar chart, CSS/SVG]  │
└────────────────────────────────┘
```

---

### Screen 4: Price (Analytics Tab)

**Purpose**: Browse price history across all categories, spot spend trends.

**Layout:**
```
┌────────────────────────────────┐
│ Price            [This Month ▾]│
├────────────────────────────────┤
│  TOTAL SPEND                   │
│  ฿1,240  this month            │
│  ฿980    last month  ↑ 26%    │
├────────────────────────────────┤
│  BY CATEGORY                   │
│  Fabric Softener  ฿89   ████  │  ← tap → Category View
│  Meat             ฿312  ████████
│  Rice             ฿189  █████  │
│  Cleaning         ฿240  ██████ │
│  [See all]                     │
├────────────────────────────────┤
│  RECENT PURCHASES              │
│  Jun 11  Chicken Breast  ฿52  │  ← tap → Item Detail
│           Big C · 3 packs      │
│  Jun 10  Downy 1L        ฿89  │
│           Big C                │
│  [See all]                     │
├────────────────────────────────┤
│  STORES THIS MONTH             │
│  Big C    ฿890   3 visits      │
│  CJ       ฿350   2 visits      │
└────────────────────────────────┘
```

**Time range selector**: This Month · Last 3 Months · This Year · All Time

---

### Screen 5: Log Entry (Bottom Sheet)

**Purpose**: Record a purchase or consume. Max 3 taps for a repeat item.

**Entry point**: FAB from any screen. Also [+ Purchase] / [− Consume] on Item Detail (pre-fills item).

**Layout:**
```
┌────────────────────────────────┐
│  ▬                             │  ← drag handle
│                                │
│  [🛒 Purchase]  [📦 Consume]   │  ← toggle, Purchase default
│                                │
│  Item                          │
│  ┌──────────────────────────┐ │
│  │ Downy 1L Lavender      ▾ │ │  ← autocomplete, recent items first
│  └──────────────────────────┘ │
│  + New item                    │
│                                │
│  Quantity        Unit          │
│  ┌──────────┐  ┌────────────┐ │
│  │    2     │  │  bottles   │ │  ← unit pre-filled from item
│  └──────────┘  └────────────┘ │
│                                │
│  Price per unit    Store       │  ← purchase only, hidden on consume
│  ┌──────────┐  ┌────────────┐ │
│  │   89     │  │  Big C   ▾ │ │  ← store: recent stores shown first
│  └──────────┘  └────────────┘ │
│                                │
│  Date                          │
│  ┌──────────────────────────┐ │
│  │  Today, Jun 12         ▾ │ │
│  └──────────────────────────┘ │
│                                │
│  Note (optional)          [+] │  ← collapsed by default
│                                │
│  [           Save            ] │
└────────────────────────────────┘
```

**Autocomplete behavior:**
- Recent items shown first (no typing needed for repeat logs)
- Typing filters by item name and category name
- Selecting an existing item pre-fills unit

**New item inline flow** (no new screen):
1. Item name (free text)
2. Category (existing list + "New category" option)
3. Unit
4. Continues to quantity/price fields

**Repeat purchase fast path**: Last store pre-selected, last quantity pre-filled. User confirms/changes price only. 2 taps + Save.

**Consume mode**: Price and Store fields hidden entirely.

---

### Screen 6: Edit Entry Sheet

**Purpose**: Correct a logged entry. All fields editable.

**Entry point**: [✏] icon on any history row in Item Detail.

**Layout:** Same as Log Entry sheet, pre-filled with existing values.

**Additional element at bottom:**
```
│  ─────────────────────────── │
│  [🗑 Delete this entry]       │  ← destructive, red text
```

**Behavior:**
- Changing type (Purchase ↔ Consume) shows/hides Price and Store fields
- Changing quantity recalculates stock count on save
- Delete → triggers Delete Entry confirmation (see below)
- Save → updates entry, recalculates stock, returns to Item Detail

---

### Screen 7: Edit Item Sheet

**Purpose**: Rename an item or reassign its category.

**Entry point**: [✏] icon on Item Detail header.

**Layout:**
```
┌────────────────────────────────┐
│  ▬                             │
│  Edit Item                     │
│                                │
│  Name                          │
│  ┌──────────────────────────┐ │
│  │ Downy 1L Lavender        │ │
│  └──────────────────────────┘ │
│                                │
│  Category                      │
│  ┌──────────────────────────┐ │
│  │ Fabric Softener        ▾ │ │
│  └──────────────────────────┘ │
│                                │
│  Unit                          │
│  ┌──────────────────────────┐ │
│  │ bottle                 ▾ │ │
│  └──────────────────────────┘ │
│  ⚠ Changing unit affects      │
│    how stock is displayed.     │  ← warning, shown only if entries exist
│                                │
│  [           Save            ] │
│                                │
│  ─────────────────────────── │
│  [🗑 Delete item + all history]│  ← destructive
└────────────────────────────────┘
```

---

### Screen 8: Delete Confirmations

**Delete Entry:**
```
┌────────────────────────────────┐
│  Delete this entry?            │
│                                │
│  Jun 10 · 🛒 2 bottles · ฿89  │
│  Big C                         │
│                                │
│  This will update your stock   │
│  count for Downy 1L Lavender.  │
│                                │
│  [Cancel]      [Delete]        │
└────────────────────────────────┘
```

**Delete Item:**
```
┌────────────────────────────────┐
│  Delete Downy 1L Lavender?     │
│                                │
│  This will permanently delete  │
│  12 entries and all price      │
│  history for this item.        │
│                                │
│  [Cancel]      [Delete]        │
└────────────────────────────────┘
```

Both are centered modals (not bottom sheets) to break the flow and signal destructiveness.

---

### Screen 9: Settings

**Layout:**
```
┌────────────────────────────────┐
│ Settings                       │
├────────────────────────────────┤
│  HOUSEHOLD                     │
│  Alex (you)                    │
│  Sam                    Active │
│  + Invite member               │
├────────────────────────────────┤
│  MY STORES                     │
│  Big C                    ✓   │
│  CJ                       ✓   │
│  + Add store                   │
├────────────────────────────────┤
│  CATEGORIES                    │
│  Fabric Softener          [✏] │
│  Meat                     [✏] │
│  + Add category                │
├────────────────────────────────┤
│  LOW STOCK ALERTS              │
│  Push notifications      ON ●  │
│  (thresholds set per item      │
│   from Item Detail)            │
├────────────────────────────────┤
│  APPEARANCE                    │
│  Dark mode               ON ●  │
│  Language         English / ไทย│
└────────────────────────────────┘
```

---

## 7. Screen Flow Map

```
Stock Tab
  └── Item Card → Item Detail
                    └── Category label → Category View
                    └── [+ Purchase] → Log Sheet (item pre-filled, purchase mode)
                    └── [− Consume]  → Log Sheet (item pre-filled, consume mode)
                    └── [✏] header   → Edit Item Sheet
                    └── [✏] entry row → Edit Entry Sheet
                                          └── [Delete] → Delete Entry Confirmation

Price Tab
  └── Category row  → Category View
                        └── Item row → Item Detail
  └── Purchase row  → Item Detail (scrolled to entry)

FAB (any screen)
  └── Log Entry Sheet
        └── New item → inline fields (no screen change)
        └── Save → previous screen, stock updated

Settings Tab
  └── Category [✏] → Edit Category Sheet (name + unit)
```

---

## 8. Empty States

| Screen | Empty State |
|---|---|
| Stock | "Nothing logged yet. Tap ╋ to add your first item." |
| Item Detail — Price Intelligence | "Log 2+ purchases to see price insights." |
| Item Detail — Store comparison | "Buy at a second store to compare prices." |
| Category View — per-unit comparison | "Add more items to compare unit prices." |
| Price Tab | "Start logging purchases to see your spending." |
| History filter (no results) | "No purchases for this item yet." |

---

## 9. User Journey Summary

### Journey 1 — Daily Consume
Sam uses the last of the shampoo → opens app → FAB → Consume → item → qty → Save.
Stock updates. Alex sees it on Stock screen next time they check.

### Journey 2 — Shopping Trip
Alex is at Big C. Opens app → Stock screen → sees Comfort 750ml is out and Downy is at 2 bottles.
Checks Item Detail for Downy → last paid ฿89, best ever ฿79. Current shelf price ฿85.
"Below my average, close to best price." Buys 3. Logs on the way out.

### Journey 3 — Did We Already Buy This?
Sam bought olive oil yesterday and logged it. Alex sees olive oil on sale.
Opens app → Stock screen → Olive Oil → last restocked yesterday. Skips it.

### Journey 4 — Low Stock Alert
App detects cooking oil stock at 0. Push notification to both Alex and Sam.
Whoever goes to the store next checks the app, sees it out, buys it, logs it.

---

## 10. Top 5 Make-or-Break Moments

| # | Moment | Why |
|---|---|---|
| 1 | First consume log (both people) | If only one person logs, the shared value disappears in week 1 |
| 2 | First time deal signal fires correctly | Builds trust in the system — "it knows my prices" |
| 3 | First shopping trip using the stock screen | Replaces the WhatsApp text habit |
| 4 | First time one person sees what the other logged | Makes the shared value tangible |
| 5 | First push notification that saved a run-out | The emotional payoff |

---

## 11. Design Constraints (from design.md)

| Constraint | Detail |
|---|---|
| Tokens | All `--primary`, `--background` etc. tokens referenced throughout — preserve |
| Glass utilities | `glass`, `glass-card` are core visual identity — extend, don't replace |
| Dark mode | Every new component must work in `.dark` context |
| i18n | All user-visible strings need EN and TH keys in `src/lib/i18n.tsx` |
| Modals | Use `createPortal` for correct z-index on iOS PWA |
| Offline-first | Reads from IndexedDB first; no UI state that assumes live network |
| Charts | CSS/SVG only — no external chart libraries |
| Accessibility | WCAG AA contrast (4.5:1) on all text |
| Auth | Existing JWT + Passkeys flow unchanged |
| Schema | Extend entries + inventory tables, don't break them |
