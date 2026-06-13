# Restock — Design System Handoff

> **Audience**: UI/UX agent or designer tasked with revamping the Restock app.  
> This document covers every design token, utility, component pattern, and interaction convention currently in the codebase — plus gaps that need to be solved in the redesign.

---

## 1. Brand Identity

| Property | Value |
|---|---|
| App name | Restock |
| Personality | Premium, clean, app-like — not a spreadsheet |
| Primary color | Electric Purple `#7f13ec` |
| Light theme name | "Daylight Glass" |
| Dark theme name | "Deep Glass" |
| Typography | Plus Jakarta Sans (variable font, loaded via `next/font`) |
| Icon library | `lucide-react` (consistent stroke width: `2` inactive, `2.5` active) |

---

## 2. Color Tokens

All tokens are CSS custom properties on `:root` (light) and `.dark`. Tailwind is wired via `@theme inline` so they're usable as `bg-primary`, `text-muted-foreground`, etc.

### 2.1 Light Mode — "Daylight Glass"

| Token | Value | Usage |
|---|---|---|
| `--background` | `#f8fafc` (Slate 50) | Page background |
| `--foreground` | `#0f172a` (Slate 900) | Body text |
| `--card` | `#ffffff` | Card surfaces |
| `--card-foreground` | `#0f172a` | Text on cards |
| `--popover` | `#ffffff` | Dropdown/tooltip backgrounds |
| `--primary` | `#7f13ec` | Brand actions, active states, focus rings |
| `--primary-foreground` | `#ffffff` | Text/icons on primary surfaces |
| `--secondary` | `#f1f5f9` (Slate 100) | Subtle backgrounds, pill inactive states |
| `--secondary-foreground` | `#475569` (Slate 600) | Secondary labels |
| `--muted` | `#f1f5f9` | Muted backgrounds |
| `--muted-foreground` | `#475569` | Placeholder text, metadata |
| `--accent` | `#f8fafc` | Highlight backgrounds |
| `--accent-foreground` | `#0f172a` | Text on accent |
| `--destructive` | `#ef4444` | Delete actions, error states |
| `--destructive-foreground` | `#ffffff` | Text on destructive |
| `--border` | `#e2e8f0` (Slate 200) | Dividers, input borders |
| `--input` | `#f1f5f9` | Input background |
| `--ring` | `#7f13ec` | Focus ring |
| `--radius` | `1rem` | Base border radius |

### 2.2 Dark Mode — "Deep Glass"

| Token | Value | Usage |
|---|---|---|
| `--background` | `#0d0d12` | Page background |
| `--foreground` | `#ffffff` | Body text |
| `--card` | `#15151e` | Card surfaces |
| `--secondary` | `#1a1a25` | Subtle backgrounds |
| `--secondary-foreground` | `#d8b4fe` | Lavender — secondary labels |
| `--muted-foreground` | `#e9d5ff` | Light lavender — placeholder text |
| `--accent` | `#261933` | Highlight background |
| `--destructive` | `#ff4d4d` | Delete actions |
| `--border` | `rgba(255,255,255,0.08)` | Subtle white glass border |

### 2.3 Semantic Glassmorphism Variables

These supplement the standard tokens to build the glass aesthetic.

| Token | Light | Dark |
|---|---|---|
| `--glass-bg` | `rgba(255,255,255,0.7)` | `rgba(13,13,18,0.8)` |
| `--glass-border` | `rgba(255,255,255,0.5)` | `rgba(255,255,255,0.08)` |
| `--glass-card-bg` | `rgba(255,255,255,0.6)` | `rgba(21,21,30,0.6)` |
| `--glass-card-hover` | `rgba(255,255,255,0.9)` | `rgba(21,21,30,0.8)` |
| `--glass-card-border` | `rgba(226,232,240,0.6)` | `rgba(255,255,255,0.05)` |
| `--input-bg` | `rgba(241,245,249,0.6)` | `rgba(26,26,37,0.5)` |
| `--input-border` | `rgba(226,232,240,0.8)` | `rgba(255,255,255,0.05)` |

### 2.4 Semantic Colors (Entry Types)

These are not tokens — they are used inline via Tailwind. Keep them consistent across the redesign.

| Semantic role | Color | Usage |
|---|---|---|
| Purchase (buy) | Emerald `emerald-500` | Left border accent, icon bg, amount text |
| Consume (use) | Orange `orange-500` | Left border accent, icon bg, quantity text |
| Destructive | `--destructive` | Delete buttons, error messages |
| Primary action | `--primary` | FAB, active nav, focused inputs |

---

## 3. Typography

Single font family: **Plus Jakarta Sans**, loaded via `next/font/google`.

| Role | Classes | Notes |
|---|---|---|
| Page heading | `text-2xl font-bold` | Modal titles, section headers |
| Card title | `text-lg font-bold` | Item name on cards |
| Body | `text-sm` or `text-base font-bold` | General content |
| Metadata / label | `text-[10px] font-bold uppercase tracking-[0.2em]` | Date stamps, category labels |
| Gradient heading | `.text-premium-gradient` | Hero text, brand callouts |
| Muted text | `text-muted-foreground` | Secondary info, placeholders |

---

## 4. Spacing & Shape

| Token | Value | Usage |
|---|---|---|
| `--radius` | `1rem` (16px) | Base radius |
| `--radius-xl` | `1rem` | Standard card corners |
| `--radius-2xl` | `1.5rem` (24px) | Modals, dropdowns |
| `--radius-3xl` | `2rem` (32px) | Large cards (`rounded-[2rem]`) |
| Modal top radius | `2.5rem` (40px) | Bottom sheet top corners on mobile |

Spacing follows Tailwind defaults (4px base). No custom spacing scale defined — use Tailwind's built-in scale.

---

## 5. Custom Utility Classes

Defined with `@utility` in `globals.css`. Use these instead of repeating raw Tailwind.

### `glass`
Main surface for headers, modals, and the navigation bar.
```
backdrop-blur-xl  bg-(--glass-bg)  border border-(--glass-border)
```

### `glass-card`
Interactive cards with hover lift. Used on every entry card and inventory card.
```
backdrop-blur-md  bg-(--glass-card-bg)  border border-(--glass-card-border)
shadow-xl  transition-all duration-300
hover: bg-(--glass-card-hover)  border-primary/20  shadow-2xl
```

### `input-premium`
Standardized form input. Use on all `<input>` and `<textarea>` elements.
```
block w-full  px-5 py-4  rounded-2xl
bg-(--input-bg)  border border-(--input-border)
text-foreground font-bold  outline-none  transition-all duration-300
placeholder: text-muted-foreground/70
focus: border-primary/40  ring-4 ring-primary/10
```

### `text-premium-gradient`
Purple-to-lavender gradient text.
```
bg-clip-text text-transparent  bg-linear-to-r from-primary to-[#c4b5fd]
```

### `login-glow`
Purple box-shadow glow. Used on the FAB and primary CTA buttons.
```
box-shadow: 0 0 30px rgba(127,19,236,0.25)
```

### `safe-bottom`
iOS safe-area bottom padding. Always apply to fixed bottom elements.
```
padding-bottom: env(safe-area-inset-bottom)
```

### `thumb-zone`
Fixed bottom container for navigation and action bars.
```
fixed bottom-0 left-0 right-0  z-50  safe-bottom  pt-3
```

---

## 6. Component Patterns

### 6.1 Icon Button (action button in cards)

44×44px minimum touch target. Pattern used in `EntryCard.tsx`.

```
h-11 w-11  flex items-center justify-center
rounded-xl  transition-all  active:scale-90
text-muted-foreground
hover:text-primary hover:bg-primary/10          ← standard action
hover:text-destructive hover:bg-destructive/10  ← destructive action
```

### 6.2 Entry Card (`EntryCard.tsx`)

Glass card with colored left border indicating entry type.

- Container: `glass-card p-6 rounded-[2rem] border-l-4`
  - Purchase: `border-l-emerald-500/30`
  - Consume: `border-l-orange-500/30`
- Icon badge: `h-12 w-12 rounded-2xl` with `bg-[color]/10 text-[color]`
- Amount badge: `text-xl font-bold px-4 py-2 rounded-2xl bg-[color]/5`
- Note block (optional): `bg-secondary/30 p-4 rounded-2xl border border-primary/5`
- Action row: separated by `border-t border-primary/5`

### 6.3 Bottom Navigation (`BottomNav.tsx`)

Floating pill bar, centered horizontally, above safe area.

- Container: `glass rounded-3xl px-3 py-3 w-[calc(100%-2.5rem)] max-w-sm`
- Position: `fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))]`
- 5 items: Stock · Trends · **FAB** · History · Settings
- Active state: `bg-primary/20 scale-110 shadow-lg text-primary`
- Inactive state: `text-muted-foreground hover:text-foreground`
- FAB (center): `h-14 w-14 rounded-2xl bg-primary text-white login-glow`

> **Redesign note**: The nav currently has 5 items. The redesign should reduce to 4 (Stock, Log FAB, Trends, Settings) and make the FAB more prominent.

### 6.4 Pill Selector (`PillSelector.tsx`)

Horizontally scrollable pill group. Used for unit selection.

- Container: `overflow-x-auto flex gap-3 pb-4`
- Active pill: `bg-primary text-white border-primary shadow-lg shadow-primary/30`
- Inactive pill: `bg-secondary/50 border-primary/10 text-muted-foreground`
- Pill shape: `h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em]`
- Scroll hint: active item scrolls into view on mount via `scrollIntoView`

### 6.5 Autocomplete (`Autocomplete.tsx`)

Text input with dropdown. Used for item name entry.

- Input: uses `input-premium` utility
- Dropdown: `glass shadow-2xl rounded-2xl border border-primary/10 animate-in fade-in slide-in-from-top-2`
- Option row: `h-12 px-4 rounded-xl hover:bg-primary/10 hover:text-primary font-bold text-sm`
- Active option: shows `<Check size={16} className="text-primary" />` on the right

### 6.6 Bottom Sheet Modal (current modal pattern)

Modals use `createPortal` to render at document root. On mobile they slide up from the bottom; on `sm:` breakpoint they center.

- Backdrop: `fixed inset-0 bg-black/50 backdrop-blur-sm`
- Sheet: `glass rounded-t-[2.5rem] sm:rounded-[2.5rem] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10`
- Drag handle (mobile only): `sm:hidden w-12 h-1.5 bg-primary/20 rounded-full mx-auto mt-4`
- Close button: icon button pattern (see 6.1)

---

## 7. Motion & Animation

| Pattern | Implementation |
|---|---|
| Page transitions | Native View Transitions API via `@view-transition { navigation: auto }` |
| Modal entrance | `animate-in slide-in-from-bottom-full duration-300` (Tailwind Animate plugin) |
| Dropdown entrance | `animate-in fade-in slide-in-from-top-2 duration-300` |
| Nav entrance | `animate-in slide-in-from-bottom-10 duration-700 delay-500` |
| Button press | `active:scale-90` or `active:scale-95` |
| FAB hover | `group-hover:scale-110` |
| Active nav icon | `scale-110` transition via `transition-all duration-300` |
| Card hover | `shadow-2xl` lift via `glass-card` utility |

Duration convention: `300ms` for micro-interactions, `700ms` for page-level entrance animations.

---

## 8. Layout Structure

### Mobile (PWA — primary)

```
┌─────────────────────────┐
│  Page Header (glass)    │  sticky top, backdrop-blur
├─────────────────────────┤
│                         │
│  Scrollable Content     │  pb-32 to clear bottom nav
│                         │
│                         │
├─────────────────────────┤
│  Bottom Nav (floating)  │  fixed, above safe area
└─────────────────────────┘
```

- Single column
- Bottom-heavy navigation (thumb zone)
- All modals are bottom sheets (`items-end` on mobile, `items-center` on `sm:`)

### Desktop (secondary)

- Currently uses same layout as mobile — **this is a gap to fix in the redesign**
- Target: sidebar navigation + 2–3 column card grid

---

## 9. Existing Screens

| Route | Component | Description |
|---|---|---|
| `/app` | `DashboardClient.tsx` | Chronological feed of all entries (purchase + consume) |
| `/app/inventory` | `InventoryClient.tsx` | Per-item stock snapshot list |
| `/app/inventory/[item]` | `ItemDetailClient.tsx` | Single-item history + timeline |
| `/app/trends` | `TrendsClient.tsx` | Monthly spend analytics |
| `/app/settings` | `settings/page.tsx` | Theme, language, passkey management |

### Modals (portal-rendered)
| Component | Trigger |
|---|---|
| `AddEntryModal.tsx` | FAB (+ button in nav) |
| `EditEntryModal.tsx` | Edit icon on entry card |
| `DeleteEntryModal.tsx` | Trash icon on entry card |
| `TimelineModal.tsx` | Trending-up icon on entry card |
| `ManageInventoryModal.tsx` | Inventory management flow |

---

## 10. Design References

Screenshots of the current app are in `design-references/`:

| Folder | Content |
|---|---|
| `add_item_dark_mode/` | Add entry bottom sheet, dark theme |
| `landing_page_dark_mode/` | Marketing landing page, dark theme |
| `login_screen_dark_mode/` | Auth screen, dark theme |
| `settings_screen_dark_mode/` | Settings page, dark theme |
| `signup_screen_dark_mode/` | Registration screen, dark theme |

---

## 11. Gaps & Redesign Priorities

These are the specific UX problems the redesign must solve. See `README.md` for the full vision.

| # | Gap | Severity | Notes |
|---|---|---|---|
| 1 | No stock-level visual indicator | High | Items show raw numbers only — no bar, gauge, or color signal |
| 2 | No consumption rate / run-out estimate | High | Core value prop of a stock tracker is missing |
| 3 | No price history chart per item | High | Price trends are buried in the timeline modal |
| 4 | Item detail page lacks analytics | High | Timeline exists but has no stats panel |
| 5 | Add entry modal is centered on desktop | Medium | Should be a side panel or centered sheet, not bottom-sheet on large screens |
| 6 | Dashboard is a flat chronological feed | Medium | Mix of all items makes it hard to focus on one |
| 7 | Bottom nav has 5 items (crowded) | Medium | Should be 4 max; FAB should be more prominent |
| 8 | No desktop-specific layout | Medium | Same single-column layout on all screen sizes |
| 9 | No low-stock highlight / alert surface | Medium | Items below threshold not surfaced on home screen |
| 10 | No per-item monthly chart | Low | Trends page only shows aggregate spend |

---

## 12. Constraints for the Redesign

| Constraint | Detail |
|---|---|
| Tokens must be preserved | All `--primary`, `--background`, etc. tokens are referenced throughout — rename only with global find/replace |
| `glass` and `glass-card` utilities | Core to the visual identity — extend, don't replace |
| Dark mode required | Every new component must work in `.dark` context |
| i18n | All user-visible strings must have EN and TH keys in `src/lib/i18n.tsx` |
| `createPortal` for modals | Required for correct z-index stacking on iOS PWA viewports |
| Offline-first | No UI state that assumes a live network; reads from IndexedDB first |
| No external chart libraries | CSS/SVG only — keeps the bundle light |
| WCAG AA contrast | All text must meet 4.5:1 on its background |
