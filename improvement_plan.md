# Improvement Plan

Purpose: a concise, ordered backlog of refactors and optimizations to keep the codebase simple, reliable, and easy to maintain.

Status markers: [Planned] to do. Completed items are removed from this list once merged.

## UX Alignment (Aura)

- Add `SidebarSection` and `EmptyState` primitives using `@mirohq/design-system`. [Planned]
- Replace ad‑hoc spacing with `@mirohq/design-tokens`; reduce custom CSS. [Planned]
- Convert Help, Search, and Style tabs to use `SidebarSection` headings. [Planned]
- Normalize form controls to design-system `Form` components and field groups. [Planned]
- Add empty/loading states to long operations (board scan, imports, diff). [Planned]
- Audit keyboard navigation and focus order across Tabs, modals, and lists. [Planned]

## Jobs & Backend Infrastructure

- Progressive job status API for UI progress bars [Planned]
    - What’s needed: Add incremental job progress endpoints/events (percent, ETA, current step) to support granular progress UI and cancel.
    - Where: `src/services/*` long‑running ops; `src/routes/*` job endpoints; extend `changeQueue` to publish progress; optional SSE at `/api/jobs/:id/events`.
    - DoD: UI receives progress updates at least every 300ms; cancel endpoint `DELETE /api/jobs/:id` cleanly stops work; tests cover SSE and cancellation.

- Optimistic operation journaling [Planned]
    - What’s needed: Persist optimistic ops journal to allow undo/rollback when Miro API rejects batch items.
    - Where: `src/frontend/core/hooks/useOptimisticOps.ts`; backend reconciliation in `src/services/miroService.ts`.
    - DoD: Failed ops visibly roll back in UI with a toast and diff; journal flushed on success; tests cover happy/failed flows.

- Telemetry pipeline (privacy‑first) [Planned]
    - What’s needed: Add optional anonymized event telemetry (feature usage, latencies, errors) with user consent toggle.
    - Where: Event sink in `src/config/logger.ts` or lightweight analytics module; opt‑in setting persisted per board.
    - DoD: Events buffer locally and batch‑send; PII scrubbed; toggle surfaced in Settings; docs updated.

## UX & Navigation

- First‑run onboarding tour [Planned]
    - What’s needed: Contextual coach marks for the three core actions (Import, Layout, Sync) and a “Try with sample data” path.
    - Where: `src/frontend/pages/HelpTab.tsx`, new `src/frontend/ui/components/CoachMarks.tsx`, integrate with `App.tsx` first‑run check (board metadata / localStorage).
    - DoD: First open shows 3–5 step tour, skippable and never auto‑repeats; sample board creates non‑destructive widgets for demo.

- Command palette and shortcuts [Planned]
    - What’s needed: Add `Cmd/Ctrl+K` palette to run actions (search, layout, style presets, selection ops). Document shortcuts.
    - Where: `src/frontend/ui/components/CommandPalette.tsx` (new); wire into existing actions in `pages/` and hooks.
    - DoD: Palette opens with `Cmd/Ctrl+K`; arrow/Enter navigates; actions execute; help lists available shortcuts.

- Consistent panel IA and tabs [Planned]
    - What’s needed: Audit tab taxonomy; prioritize common tasks; reduce to 5–7 top‑level tabs; move advanced items to nested tabs with clear labels.
    - Where: `src/frontend/ui/pages/tabs.ts`, `tab-definitions.ts`, each Tab component.
    - DoD: Tabs ordered by frequency; labels concise; tree fits Miro panel height without scrolling on 768px.

- Settings panel (per board) [Planned]
    - What’s needed: Consolidate toggles for telemetry opt‑in, default layout options, import behaviors; persist in board metadata.
    - Where: New `SettingsTab.tsx`; persistence via existing metadata utilities.
    - DoD: Settings persist per board; toggle changes reflected immediately.

- Context menu integration [Planned]
    - What’s needed: Provide right‑click context menu entries for common actions when supported by Miro SDK.
    - Where: Miro SDK integration points and UI action handlers.
    - DoD: Users can trigger key actions from selection context without opening the panel.

## Feedback & Error Handling

- Loading and skeleton states [Planned]
    - What’s needed: Add skeletons/placeholders for board scans, imports, and long operations; avoid spinner‑only states.
    - Where: `src/frontend/components/BoardLoader.tsx`, pages invoking async work.
    - DoD: Each async view renders skeleton within 100ms; shimmer duration ≤ 400ms motion token.

- Job Drawer UX overhaul [Planned]
    - What’s needed: Unify progress bars, step list, errors, and retry in `JobDrawer`; add “Copy error details” and “Report issue”.
    - Where: `src/frontend/components/JobDrawer.tsx`, `DiffDrawer.tsx` integration.
    - DoD: Users see granular progress and can retry/cancel; detailed error view available and copyable.

- Error handling microcopy and remediation [Planned]
    - What’s needed: Human‑friendly error titles, causes, and next steps (e.g., “Reconnect Miro”); consistent toasts vs inline errors.
    - Where: Shared error mapper in `src/frontend/core/*` and components.
    - DoD: Errors are actionable; retry paths visible; no raw exception text leaks.

- Empty states with guidance [Planned]
    - What’s needed: Purposeful empty views with illustration, one primary CTA, and link to Help.
    - Where: Each tab initial state.
    - DoD: Empty screens helpful and consistent; tracked via telemetry.

- Offline/network state & retry UX [Planned]
    - What’s needed: Show network banner, queue actions offline, auto‑retry with backoff; clear resume messaging.
    - Where: Global app shell and network hook; integrates with queue.
    - DoD: Temporary disconnects don’t lose actions; banner disappears on recovery.

## Selection & Editing

- Selection‑aware quick actions [Planned]
    - What’s needed: Show context ribbon when selection changes (group, align, style preset, tag apply, layout selection).
    - Where: `src/frontend/components/SyncStatusBar.tsx` or new `QuickActions.tsx`; hook into `useSelection`.
    - DoD: Selecting items reveals context actions; keyboard access works; actions disabled when invalid.

- Search & filter UX upgrade [Planned]
    - What’s needed: Fuzzy search with highlight and keyboard navigation; filter by type/tag; enable “jump to on board”.
    - Where: `src/frontend/ui/pages/SearchTab.tsx`, `node-search.ts`, `search-tools.ts`.
    - DoD: Query highlights matches; Up/Down selects result; Enter zooms on board; filters persist per board.

- Style presets: preview and apply [Planned]
    - What’s needed: Add visual previews for presets with hover/keyboard preview‑on‑selection; allow “apply to selection”.
    - Where: `src/frontend/ui/style-presets.ts`, `StyleTab.tsx`.
    - DoD: Hover previews selection without commit; click applies; keyboard left/right cycles; undo supported.

- Layout tooling improvements [Planned]
    - What’s needed: Live layout preview with ghost frames; “apply to selection”; layout constraints in UI.
    - Where: `src/frontend/core/graph/layout-*`, `LayoutEngineTab.tsx`.
    - DoD: Preview toggles on/off; apply respects constraints; visible guidance for invalid selections.

## Performance & Scalability

- Performance: virtualization & progressive rendering [Planned]
    - What’s needed: Virtualize long lists (results, diff); debounced interactions; chunked board scanning; show progress.
    - Where: Search/Results lists, DiffDrawer, board scanning services.
    - DoD: 60fps interactions on 5k+ items; time‑to‑interactive < 200ms for panel.

## Accessibility & Internationalization

- Keyboard navigation & focus management [Planned]
    - What’s needed: Ensure all interactive controls reachable via keyboard; visible focus; modal focus trap; `Esc` to close.
    - Where: Modal, TabBar, Search results, JobDrawer.
    - DoD: Keyboard‑only flow completes core tasks; tests include a11y checks.

- Internationalization scaffold [Planned]
    - What’s needed: Wrap copy in i18n; extract messages; enable locale switch for future translations.
    - Where: Lightweight i18n utility, message catalogs, replace literals.
    - DoD: English catalog complete; infrastructure supports adding locales without code changes.

---

---

Execution guidance:

- Prefer small, reviewable PRs grouped by section above.
- Add/update tests alongside behavior changes.
- Keep changes minimal and avoid incidental refactors.
