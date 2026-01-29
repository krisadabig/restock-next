---
name: premium-pwa-design
description: Standards for building high-end, mobile-first PWAs in Next.js 16 with Tailwind 4.
---

# Premium PWA Design Skill

This skill defines the visual and ergonomic standards for the Bill-Harmony redesign, focused on a "Premium Dark" mobile experience.

## Core Directives

1. **The 44px Rule**: All tap targets (buttons, inputs, list items) must be at least 44px in size for mobile ergonomic friendliness.
2. **Thumb Zone Layout**: Primary actions (Add Bill, Search, Tab Navigation) must be placed at the bottom of the screen within the reach of the user's thumb.
3. **Safe Area Insets**: Always apply `padding-bottom: env(safe-area-inset-bottom)` to account for device home bars.
4. **Premium Dark Aesthetic**: Use deep greys (`#0a0a0a`, `#171717`) instead of pure black for backgrounds. Favor subtle borders and "glass" effects.

## UI Components & Tokens

### Color Palette (Tailwind 4)
```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #171717;
  --accent: #3b82f6; /* Modern Blue */
  --text-muted: #a3a3a3;
}
```

### Motion & Transitions
Use Next.js 16/React 19 View Transitions for seamless page navigations that feel like a native app.

```typescript
// Example of a page transition layout
export default function Layout({ children }) {
  return (
    <div className="view-transition-container">
      {children}
    </div>
  );
}
```

## Form UX

- **Optimistic UI**: Use `useOptimistic` for instant feedback on bill item additions.
- **Beautiful Loading States**: Favor skeletons and subtle pulse animations over generic spinners.
- **Micro-interactions**: Add slight haptic-like animations (0.2s scale effects) on button taps.

## Best Practices

- **RSC for Layout**: Keep layout components as Server Components for performance.
- **Container Queries**: Use Tailwind 4 container queries for responsive components that adapt to their parent container.
- **Image Generation**: Use the `generate_image` tool for high-quality assets or icons if placeholders are needed.
