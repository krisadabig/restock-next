# Visualizing Application Structure

## Goal Description
Create a comprehensive reference package for the application, visualizing its structure, architecture, and UI. This will serve as a future reference and onboarding guide.

## Proposed Changes

### Documentation Structure
Create a new directory `docs/reference/` to house all visualization assets.

#### [NEW] [file-structure.tree](file:///docs/reference/file-structure.tree)
- Textual representation of the project's file tree (excluding `node_modules`, `.git`, etc.).

#### [NEW] [architecture.md](file:///docs/reference/architecture.md)
- **System Context Diagram**: High-level view of users and systems.
- **Database Schema**: Mermaid ER diagram of Drizzle schema.
- **Component Architecture**: Diagram showing the relationship between Next.js pages, components, and API.

#### [NEW] [tech-stack.md](file:///docs/reference/tech-stack.md)
- List of key technologies (Frameworks, Libraries, Tools) derived from `package.json`.

#### [NEW] [screenshots/](file:///docs/reference/screenshots/)
- `landing.png`
- `login.png`
- `dashboard-empty.png`
- `dashboard-populated.png`
- `inventory-list.png`
- `inventory-detail.png`
- `settings.png`
- `modal-add-entry.png`

## Verification Plan

### Manual Verification
- Review generated diagrams for accuracy.
- Check screenshots for visual correctness.
- ensuring `file-structure.tree` is readable.

### Automated Test
- None required (Documentation only).
