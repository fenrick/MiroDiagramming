# Panel UX Cheatsheet

Quick reference for building Miro sidebar panels with `@mirohq/design-system`.

## Anatomy

- Header: tabs (`Tabs.List` + `Tabs.Trigger`).
- Body: `PanelShell` → page content (`TabPanel`) → sections (`SidebarSection`).
- Footer: `StickyActions` with primary/secondary buttons.

## Patterns

- Empty State: `EmptyState` with primary action.
- Progress: `<output>` for accessible progress text; optional determinate bar.
- Error: toast via `notifications.ts`.

## Do

- Constrain width; avoid horizontal scrolling.
- Prefer design-system components and tokens.
- Announce long operations; provide cancel when possible.

## Don’t

- Don’t rely on raw HTML where DS components exist.
- Don’t zoom or reposition the viewport without clear user intent.
- Don’t block the UI without feedback.
