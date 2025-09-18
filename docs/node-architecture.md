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
  web/         # HTML entry points used by Vite build
```

There is no longer a `src/app.ts`, `src/server.ts`, or Fastify route tree. All imports of `fetch('/api/...')` have been removed or replaced with SDK calls.

## App Boot Flow

1. `src/index.ts` logs startup and initialises `DiagramApp`.
2. `DiagramApp` mounts the React panel (`App` component) when the user launches the app.
3. Board interactions (selection, widget creation) use helpers under `src/board/` that wrap `miro.board` methods. When running outside Miro the helpers bail out and surface a friendly warning.

## Board Utilities

- `board/board-cache.ts` caches selections and widget queries in memory using `miro.board.get({ type })`.
- `board/card-processor.ts` creates and updates cards directly via `miro.board.createCard`.
- `board/sticky-tags.ts` inspects sticky note content, creates missing tags with `miro.board.createTag`, and syncs edited widgets.
- `board/templates.ts` and `core/utils/shape-client.ts` generate shape groups using the Web SDK; no HTTP batching layer is required.

## Data & Excel Sync

`core/excel-sync-service.ts` maps Excel rows to board widgets. It now depends solely on the Web SDK (`ShapeClient`) for fetch and mutation operations and no longer queues remote jobs.

## Telemetry & Logging

Telemetry events flow through `src/core/telemetry.ts` and log to the console (`src/logger.ts`). There is no HTTP log sink.

## Auth & Rate Limits

OAuth redirects and `/api/auth/status` checks have been removed. `useAuthStatus` assumes SDK access as the source of truth and exposes `signIn` as a best-effort call to `miro.board.openApp()` for convenience. Rate-limit polling endpoints were deleted along with the Fastify service; UI now reacts only to local optimistic state.

## Build & Deployment

- `npm run dev` → `vite dev`
- `npm run build` → `vite build`
- `npm run preview` → `vite preview`

Output is a static bundle that can be served via `src/web/default.conf.template` (no API proxying required). Environment variables now use the `VITE_*` prefix and are consumed client-side.

## Testing Expectations

- Jest/Vitest client tests cover React hooks and view logic under `tests/client/`.
- There are no integration tests hitting HTTP endpoints because none exist.
- New features should provide jsdom coverage where practical.

## Migration Notes

If you spot references to the removed Node backend (Prisma, Fastify, `/api` route calls), please delete or rewrite them. `implementation_plan.md` tracks any follow-up clean-up – update that document whenever you finish an item.
