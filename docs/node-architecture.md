# Frontend Architecture (Miro Web SDK)

The application now runs entirely in the browser. All board operations are executed through the official Miro Web SDK, and the Vite-built React app is the only runtime we ship. This document captures the high-level structure so contributors understand where features live after the server-side removal.

## Goals

- Zero backend services. The app bundles to static assets and runs inside Miro.
- Use the Web SDK for board CRUD, selection, tagging, and template creation.
- Keep the existing React UI/UX while simplifying deployment.
- Preserve strict TypeScript, ESLint, Vitest quality gates.

## Tech Stack

- Runtime: Browser (ES2022) with Vite, React 18, TypeScript (strict).
- Miro integration: `window.miro` Web SDK and `@mirohq/websdk-types` typings.
- Styling: `@mirohq/design-system`, `@mirohq/design-tokens`, Stitches CSS-in-JS.
- Testing: Vitest + @testing-library/react (jsdom).
- Tooling: ESLint, Prettier, Husky hooks, commitlint.

## Repository Layout

```
src/
  app/         # React entry shell and panels
  assets/      # Static assets consumed by the UI
  board/       # Board utilities (selection cache, templates, processors)
  components/  # Reusable UI primitives
  core/        # Hooks, state, telemetry, data mappers
  stories/     # Optional storybook entries
  ui/          # Panel pages, hooks, and composite components
index.html     # Single HTML entry served by Vite
```

There is no longer a `src/app.ts`, `src/server.ts`, or Fastify route tree. All imports of `fetch('/api/...')` have been removed or replaced with SDK calls.

## App Boot Flow

1. `src/main.tsx` logs startup and initialises `DiagramApp`.
2. `DiagramApp` mounts the React panel (`App` component) when the user launches the app.
3. Board interactions (selection, widget creation) use helpers under `src/board/` that wrap `miro.board` methods. When running outside Miro the helpers bail out and surface a friendly warning.

## Board Utilities

- `board/board-cache.ts` caches selections and widget queries in memory using `miro.board.get({ type })`.
    - The cache no longer reaches for globals; callers must pass an explicit board instance. This avoids import cycles and eases testing.
- `board/sticky-tags.ts` now builds user messages with explicit conditionals (no nested ternaries) for clarity.
- Command palette uses native list markup and buttons for options to improve accessibility and mobile support.
- Empty states and loading indicators use `<output aria-live="polite">` instead of ARIA `status`.
- Modal backdrop is a real `<button>` and the dialog uses native `<dialog>` semantics (no extra ARIA roles required).
- `board/card-processor.ts` creates and updates cards directly via `miro.board.createCard`.
- `board/sticky-tags.ts` inspects sticky note content, creates missing tags with `miro.board.createTag`, and syncs edited widgets.
- `board/templates.ts` and `core/utils/shape-client.ts` generate shape groups using the Web SDK; no HTTP batching layer is required.

## Data & Excel Sync

`core/excel-sync-service.ts` maps Excel rows to board widgets. It now depends solely on the Web SDK (`ShapeClient`) for fetch and mutation operations and no longer queues remote jobs.

## Telemetry & Logging

Telemetry events flow through `src/core/telemetry.ts` and log to the console (`src/logger.ts`). There is no HTTP log sink.

## Auth & Rate Limits

There is no standalone authentication flow. The panel depends on being launched from within Miro, so Web SDK availability doubles as the access check. Former OAuth prompts, banners and backend polling endpoints were removed with the server. Rate-limit polling endpoints were deleted along with the Fastify service; the UI now reacts only to local optimistic state.

## Build & Deployment

- `npm run dev` → `vite dev`
- `npm run build` → `vite build`
- `npm run preview` → `vite preview`

Output is a static bundle that can be served via `config/default.conf.template` (no API proxying required). Environment variables now use the `VITE_*` prefix and are consumed client-side.

### Developer Scripts

- `scripts/generate-client.ts` uses top-level `await` and ESM-friendly path resolution (`fileURLToPath`) to invoke `openapi-typescript`. Node 20+ is required.
- `src/index.ts` registers UI handlers at top-level (no init wrapper) to align with ES2022 module style.

## Testing Expectations

- Jest/Vitest client tests cover React hooks and view logic under `tests/client/`.
- There are no integration tests hitting HTTP endpoints because none exist.
- Client tests live under `tests/client/**` and use jsdom. A basic a11y test for the App shell ensures we avoid `tabIndex` on non-interactive containers.
- New features should provide jsdom coverage where practical.

## Migration Notes

If you spot references to the removed Node backend (Prisma, Fastify, `/api` route calls), please delete or rewrite them. `implementation_plan.md` tracks any follow-up clean-up – update that document whenever you finish an item.
