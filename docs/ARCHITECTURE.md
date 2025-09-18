# Architecture Overview

Quick Tools is now a single-page React application that runs inside Miro. All board access happens directly through the Miro Web SDK; there is no backend service.

## High-Level Diagram

```
React UI (Vite bundle)
       │
       ▼
Miro Web SDK (window.miro)
       │
       ▼
Miro Board
```

## Key Modules

- `src/app/` – React entry point, shell, and panel layout.
- `src/board/` – Board utilities (selection cache, templates, processors, sticky tag helpers).
- `src/core/` – Shared hooks, optimistic updates, Excel sync service, telemetry.
- `src/ui/` – Tabs, components, and hooks that compose the UI.
- `src/assets/` – Static assets imported by the UI.

## Data Sources

- **Excel / JSON uploads** – Processed client-side using `exceljs` (dynamically imported) and mapped into board operations.
- **Board state** – Retrieved via `miro.board.get` and cached in-memory (`board-cache.ts`).

## Board Operations

- Shapes and template creation use `ShapeClient`, a thin wrapper around `miro.board.createShape`, `get`, `sync`, and `delete`.
- Card import/update is handled by `CardProcessor`, which calls `miro.board.createCard` and manipulates widgets directly.
- Sticky note tagging uses `TagClient` (`miro.board.createTag` + cached lookups).

## Build & Run

- Development: `npm run dev` → `vite dev` (hot module reload).
- Production: `npm run build` produces static assets under `dist/`. Serve that directory with nginx, Vercel, Netlify, etc. `npm run preview` provides a local sanity check.

## Error Handling & Telemetry

- Logging is performed via `src/logger.ts`, which writes to `console` unless disabled by `VITE_LOGFIRE_SEND_TO_LOGFIRE`.
- `src/core/telemetry.ts` records significant events (diffs shown/applied, OAuth prompts) by logging locally. No server collection is performed.

## Authentication & Permissions

- The app assumes the user launches it inside Miro. `useAuthStatus` treats SDK availability as the source of truth. If Miro access is missing, the UI prompts the user to open the app within a board.
- Board permissions are governed by the scopes granted to the Miro app; ensure the manifest covers widget CRUD.

## Deployment Responsibilities

- Host the static bundle and configure the Miro app manifest URL.
- Monitor bundle delivery (HTTP status/latency). There are no long-running processes to supervise.

Refer to `docs/node-architecture.md` for more detailed module descriptions and `docs/DEPLOYMENT.md` for the hosting checklist.
