# Visual Audit Skill

## Purpose
To verify that the code implementation matches the "Human-Beautiful" standards defined in `@design-lead.md` and the visual style in `/design-references`.

## Workflow
1. **Environment Check:** Ensure the Next.js dev server is running on port 3000.
2. **Current State Capture:** Use `playwright-mcp` to:
   - Navigate to the page being edited.
   - Set viewport to 390x844 (iPhone 15 Pro).
   - Take a full-page screenshot and save it to `.agent/temp/current_state.png`.
3. **Reference Comparison:**
   - Scan the `/design-references` folder.
   - Compare the layout, spacing, and typography of `current_state.png` against the reference images.
4. **Ergonomic Audit:**
   - Use Playwright to check the coordinates of all `<button>` and `<a>` tags.
   - Flag any primary actions located in the "Non-Thumb Zone" (top 25% of the screen).
5. **Reporting:**
   - Provide a list of visual "bugs" (e.g., "The padding on the grocery list items is too tight compared to the Stripe reference image").