# Restock Engineering Standards

This document defines mandatory technical guardrails for all development on the Restock project.

## ⚛️ React & Hydration Safety
To prevent hydration mismatches and "set state in effect" lints:
- **Rule**: Any logic that depends on `localStorage`, `window`, or `matchMedia` MUST be guarded by a `mounted` state.
- **Implementation**:
  ```tsx
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null; // or skeleton
  ```
- **Rule**: Use a 0ms `setTimeout` if you must trigger a `setState` synchronously with mount to avoid cascading render warnings.

## 🖼 Asset Integrity
To prevent broken images in documentation and the application:
- **Rule**: All generated assets MUST be moved to the `public/` directory immediately.
- **Rule**: Documentation (Artifacts) MUST use absolute paths for local images to ensure they render reliably in the AI brain view.

## 🧪 Robust Testing (i18n)
To prevent locale-dependent test failures:
- **Rule**: **NEVER** use static strings in Playwright locators for text that is translated (e.g., `getByText('Settings')`).
- **Rule**: Use Regex locators that include both English and Thai keys:
  ```ts
  await expect(page.locator('h1')).toHaveText(/Settings|การตั้งค่า/i);
  ```

## 🏗 UX & Reachability
- **Rule**: Major navigation and primary action buttons MUST be located in the "Mobile Thumb Zone" (bottom 60% of the screen).
- **Rule**: Redundant top headers in the App shell are prohibited; use the Bottom Nav for primary routing.

## 🛡 Workflow Enforcement
- **Rule**: BEFORE any code edit (Phase 3+), you MUST verify you are on a `feature/` branch via `git branch`.
- **Rule**: EVERY code commit MUST be preceded by a `spec.md` sync check. 
- **Rule**: Completion of any task REQUIRE running the `/handoff` workflow to ensure context is preserved for the next session.
