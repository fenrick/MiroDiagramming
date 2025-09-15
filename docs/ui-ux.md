# UI/UX Alignment (Miro Aura)

Decision date: 2025-09-14

## Decision Summary

- Stay with `@mirohq/design-system` (React) plus `@mirohq/design-tokens` and `@mirohq/design-system-themes` for theming.
- Do not adopt Mirotone as the primary layer. We may use Mirotone markup selectively where it fills minor gaps, but the React design-system remains the source of truth for components, tokens, spacing, and icons.

Rationale:

- The official Miro developer guidance recommends Mirotone for app UI built with HTML/CSS. Our app is React-first and already uses the Miro design-system packages, which expose Aura-era tokens, themes, and components that integrate cleanly with our stack.
- The design-system packages are actively maintained and map directly to the latest Miro visual language (Aura), providing a more complete React surface than a CSS-only framework.

## Principles for the Sidebar UX

- Keep it panel-first: content width constrained (~320 px), generous vertical rhythm, and zero horizontal scroll in typical cases.
- Prefer official components: Tabs, Form controls, Tooltip, Callout, Icons from `@mirohq/design-system`.
- Use tokens for all spacing, color, radius, and typography (`@mirohq/design-tokens`). Avoid hard-coded values.
- Motion and affordances: subtle, fast interactions aligned to design-system defaults; no custom heavy animation.
- Accessibility: keyboard reachability, visible focus, and semantic headings per section.

## Implementation Plan (Actionable)

Phase 1 – Foundations

1. Add sidebar primitives
    - `SidebarSection` (title + optional description)
    - `EmptyState` (icon + message + optional action)
2. Enforce theme and tokens
    - Ensure app root applies `createTheme(themes.light)` class (done)
    - Keep `tokens.css` aliases minimal and delegate to official tokens

Phase 2 – Adopt in existing screens

3. Replace ad‑hoc headings and spacing with `SidebarSection` across tabs
4. Standardize field groups using design-system `Form` components
5. Normalize lists and helper text via `Paragraph` and design-system text

Phase 3 – Refinements

6. Add consistent empty/loading states for long operations [Partially done: EmptyState]
7. Audit focus order and keyboard shortcuts (Tabs, modals, lists) [In progress]
8. Add storybook stories for primitives and key flows [Pending]

## Notes on Libraries

- Mirotone remains a good choice for non-React HTML/CSS apps and aligns with Miro’s platform guidelines. For this React app, `@mirohq/design-system` and friends are a better fit and already in use.

## Tracking

- See `implementation_plan.md` under “UX Alignment (Aura) – Phase 1–3”.
