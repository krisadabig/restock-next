---
trigger: always_on
---

# Playwright Verification Protocol

This document defines the mandatory browser-based verification steps for all UI-related tasks in the Restock project.

## 🛠 Setup Requirements
- **Runtime:** Bun
- **Command:** `bun dev` (Ensure the server is running on http://localhost:3000)
- **Tool:** @mcp:playwright (Microsoft Playwright MCP Server)

## 🔄 The Verification Loop
Whenever a UI component is modified or created, the Agent must perform the following:

### 1. Navigation & Basic Render
- Use `playwright_navigate` to go to the relevant URL.
- Verify the page status is 200 and the main container is visible.

### 2. Theme Persistence (Dark/Light Mode)
- **Action:** Use `playwright_click` on the `ThemeToggle`.
- **Verification:** Check if the `<html>` or `<body>` tag contains the `.dark` class.
- **Persistence:** Use `playwright_reload` and verify the `.dark` class remains present (checking localStorage/Cookie persistence).

### 3. I18n Validation (EN/TH)
- **Action:** Toggle language via `LanguageToggle`.
- **Verification:** - Verify `lang` attribute on `<html>` updates (e.g., from `en` to `th`).
    - Verify key UI strings (e.g., "Add Entry" vs "เพิ่มรายการ") update correctly.

### 4. Responsiveness Check
- **Action:** Set viewport to Mobile (375x812) and Desktop (1280x800).
- **Verification:** Ensure no horizontal scrolling exists and the layout remains functional.

### 5. Form & Interaction (CRUD)
- **Action:** Fill out forms (e.g., adding a restock item).
- **Verification:** - Submit the form.
    - Verify the browser redirects correctly or updates the UI list without a hard refresh.
    - Use `playwright_screenshot` to confirm the final state if layout complexity is high.

## 📝 Reporting
In the `PROJECT_MANIFEST.md` Verification Log, the agent must include:
- "Verified via Playwright MCP"
- A brief description of the specific checks passed (e.g., "Theme persistence verified after reload").