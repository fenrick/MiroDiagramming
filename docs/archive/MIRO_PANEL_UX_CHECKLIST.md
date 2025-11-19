# Miro Panel UX Checklist (Aura‑aligned)

Decision date: 2025-09-28

Purpose: quick, practical checklist for building consistent, accessible panels inside Miro using `@mirohq/design-system`.

## Layout & Structure

- Panel width ≤ `var(--size-drawer)`; no horizontal scroll.
- Wrap top‑level pages in `src/ui/PanelShell.tsx`.
- Keep primary actions visible using `src/ui/StickyActions.tsx`.
- Use `ScrollArea` for long content; avoid nested scroll regions.

## Components & Tokens

- Prefer `@mirohq/design-system` components; avoid raw HTML where a component exists.
- Use tokens for spacing/color/typography; no magic pixel values.
- Keep button sizes: primary/secondary/danger → `large`; others → `medium`.
- Provide tooltips for icon‑only controls.

## Accessibility

- All interactive elements tabbable in logical order (native navigation only).
- Use `<VisuallyHidden>` legends/labels for fieldsets and segmented controls.
- Announce progress with `<output>` or ARIA live regions.
- Provide visible focus and sufficient contrast (design‑system defaults).

## Microcopy & States

- Empty states: icon + title + one‑line description + optional action.
- Errors: toast via `notifications.ts`; keep messages user‑oriented and actionable.
- Loading: inline skeletons for short waits, empty state + progress for long tasks.

## Board Integration UX

- Long‑running board ops: show progress and allow cancel where possible.
- Respect current selection and viewport; avoid jarring zooms.
- Use `board-cache.ts` for selection reads to minimize SDK churn.
- Batch operations sequentially when the SDK lacks bulk endpoints; show progress.

## Performance

- Defer heavy work (layout/mermaid) to microtasks; chunk writes to the SDK.
- Avoid unnecessary `sync()` calls; use `maybeSync` utilities.

## Telemetry & Logging

- Use `logger.ts` for structured logs; keep console noise low by default.

## Testing & Stories

- Add stories for new primitives and complex flows.
- Add jsdom tests for a11y roles/names; no tests for custom shortcuts (not supported).
