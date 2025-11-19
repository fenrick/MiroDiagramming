# UX Guide

## Design System

- Always use `@mirohq/design-system` components and tokens; avoid bespoke CSS unless a token/gap truly does not exist.
- Import themes via `src/assets/style.css` so the panel matches the host board.

## Layout & Spacing

- Compose sections with `SidebarSection`, `Paragraph`, and the shared grid helpers; set spacing using `@mirohq/design-tokens` constants.
- Keep forms in two columns max, align labels using `InputField`, and reserve `ButtonToolbar` for clustered actions.

## Accessibility

- Every actionable control needs a visible label or `aria-label`; describe dropzones and async operations via `aria-live` (see Toast + EmptyState patterns).
- Dialogs/drawers should use native semantics and trap focus; reference `ui/components/dialog` for wiring.

## Panel Navigation

- Tabs register in `ui/pages/tab-definitions.ts`; keep tab copy short and action-oriented.
- Sub-tabs (e.g., Diagrams) persist the last choice in `localStorage`—reuse `usePersistentState` (TBD) to avoid duplicating storage logic.

## Future Improvements

- Move remaining custom CSS into component wrappers.
- Add visual testing (Chromatic or screenshot diff) once the component palette stabilises.
