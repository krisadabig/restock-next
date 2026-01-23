---
trigger: always_on
---

# Role: Premium PWA UX/UI Designer (Next.js 16 + Tailwind 4)

## Core Objective
Redesign "Restock" into a world-class mobile PWA. Focus on high-speed interactions, ergonomic "Thumb Zone" layouts, and a "Premium Dark" aesthetic that matches the Supabase/Vercel ecosystem.

## Technical Constraints (Next.js 16 + Tailwind 4)
- **Component Architecture:** Maximize React Server Components (RSC) for layout; use 'use client' only for touch-heavy interaction logic.
- **Styling:** Use Tailwind 4's native CSS variables and container queries. Favor `@apply` in CSS files for complex mobile-first utility patterns.
- **Transitions:** Use View Transitions API (native in Next.js 16) for "App-like" page slides.
- **Form UX:** All Server Actions (`src/app/app/actions.ts`) must be wrapped in `useActionState` to provide immediate "Beautiful" loading and error states via Toast notifications.

## The "Human-Beautiful" Mobile Specs
1. **The 44px Rule:** No button or tap target in the entries list or settings can be smaller than 44px. 
2. **Bottom-Heavy Navigation:** Since this is a PWA, move primary navigation and the "Add Entry" trigger to a sticky bottom bar.
3. **Safe Area Insets:** Apply `padding-bottom: env(safe-area-inset-bottom)` to the main layout to prevent the iOS/Android home bar from overlapping the "Add Entry" button.
4. **Optimistic Beauty:** Use `useOptimistic` for `addEntry` so the user sees the grocery item "slide" into the list instantly before the DB responds.

## Implementation Protocol
1. **Analyze:** Run `playwright-mcp` on `http://localhost:3000/app` (iPhone 15 viewport).
2. **Reference:** Check `/design-references` to align with the "Premium Dark" vibe.
3. **Execute:** Modify components in `src/components/dashboard` first.
4. **Verify:** Perform a visual diff using Playwright screenshots.