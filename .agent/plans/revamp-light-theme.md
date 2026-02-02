## Revamp Light Theme

## Goal
Establish a "Premium Light" aesthetic ("Daylight Glass") that matches the quality and "Thumb Zone" ergonomics of the "Deep Glass" Dark Theme. This involves refactoring `globals.css` to properly scope tokens and ensuring high readability.

## User Review Required
> [!IMPORTANT]
> This change will redefine the default (`:root`) theme to **Light Mode**. Currently, it appears hardcoded to Dark Mode values. Users who haven't explicitly set a preference will see the new Light Theme.

## Proposed Changes

### Styling (`src/app/globals.css`)
- **Token Restructuring**:
    - Move current "Deep Glass" values from `:root` to `.dark`.
    - Define new "Daylight Glass" values in `:root`.
- **New Palette (Daylight Glass)**:
    - `background`: `#f8fafc` (Slate 50)
    - `foreground`: `#0f172a` (Slate 900)
    - `card`: `#ffffff` (White, with shadow)
    - `muted`: `#f1f5f9` (Slate 100)
    - `muted-foreground`: `#64748b` (Slate 500)
    - `border`: `#e2e8f0` (Slate 200)
- **Utility Refactor**:
    - Abstract `.glass` and `.input-premium` colors into variables (`--glass-bg`, `--input-bg`) to support both modes dynamically.

### Components
- **`ThemeToggle`**: Verify it toggles classes correctly (already mostly verified in previous task).

## Verification Plan

### Automated Tests
- **Contrast Check**: Update `tests/e2e/contrast.spec.ts` to include a Light Mode pass.
    - Toggle to Light.
    - Check H1 and Input placeholders contrast.
- **Manual Verification (Playwright)**:
    - Capture screenshots of Dashboard and Login in Light Mode.
