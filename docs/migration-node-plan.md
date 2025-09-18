# Migration Plan: Simplify to Web SDK Frontend

The original goal of this document (migrating Python → Node backend) is complete and we have now retired the Node backend as well. This version records the clean-up plan for operating as a browser-only Miro app.

## Outcomes

- Fastify/Prisma server removed; repo ships only static assets + Web SDK usage.
- Frontend replaces all `/api/*` calls with direct SDK interactions.
- OAuth redirects, webhooks, and background queues deleted.
- Documentation, scripts, and tests reflect the lightweight architecture.

## Phase 1 — Retire Server Infrastructure ✅

- [Done] Delete `src/app.ts`, `src/server.ts`, `src/routes/**`, `src/services/**`, `src/miro/**`, `prisma/**`.
- [Done] Drop Fastify/Prisma dependencies from `package.json`; switch scripts to `vite`.
- [Done] Remove Node integration tests and legacy configs (`default.conf` proxies, POST /logs sink).

## Phase 2 — Frontend Rewire ✅

- [Done] Replace `apiFetch` usages with Web SDK helpers (`ShapeClient`, `TagClient`, board caches).
- [Done] Rework diff application to run locally (no job queue / job drawer).
- [Done] Inline telemetry + auth checks; remove OAuth banner triggers and REST polling.
- [Done] Update caches, templates, sticky tag helpers to read from `miro.board` directly.

## Phase 3 — Documentation & Tooling ✅

- [Done] Refresh architecture docs to describe the client-only model.
- [Done] Remove Node-specific sections from implementation plan and runbook.
- [Done] Update Vite/Nginx templates to avoid API proxying.

## Follow-ups

Log any further clean-up or enhancement ideas in `implementation_plan.md`. Treat this document as historical context for why the backend folders are gone and what assumptions the frontend now makes.
