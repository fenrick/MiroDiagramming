# Migration Plan: Move Backend to Node.js

This plan describes how to remove the Python FastAPI layer and implement a Node.js backend using the official Miro Node.js API client.

## Outcomes

- Python backend decommissioned; Node.js backend provides the same behavior
- OAuth and Miro REST operations implemented with `@mirohq/miro-api`
- Database migrated without data loss
- Documentation, tests, and CI updated

## Phases & Tasks

### Phase 0 — Branch & Docs

- Create branch `feat/node-backend-migration`
- Add this migration plan and Node architecture docs

### Phase 1 — Scaffolding

- Create `server/` project with TypeScript
- Add Fastify, Pino, ESLint (typescript-eslint), Prettier, Vitest/Jest, Supertest, c8
- Add Husky + lint-staged hooks aligned to repo standards
- Add `@mirohq/miro-api` and initial `miroClient.ts`
- Add `config/env.ts` (zod) and base `app.ts` + `server.ts`

Acceptance:

- `npm --prefix server run dev` runs a Fastify server with `/healthz`
- Lint, typecheck and tests pass in CI locally

### Phase 2 — Database & Models

- Introduce Prisma; define models: Board, Tag, Shape, UserToken, CacheEntry
- Create migration(s) from existing SQLite `app.db` tables to Prisma-managed schema
- Implement repositories for each model

Acceptance:

- Prisma connects to `app.db` or new `dev.db`, basic CRUD verified in tests

### Phase 3 — Auth & Miro Integration

- Implement TokenStorage to satisfy Miro Storage interface (persist tokens)
- Implement `/auth/miro/login` → redirect to `miro.getAuthUrl()`
- Implement `/auth/miro/callback` → `miro.exchangeCodeForAccessToken`
- Add cookie-based `userId` session generation (Fastify cookie plugin)

Acceptance:

- End-to-end OAuth flow works locally; tokens persisted; `miro.isAuthorized(userId)` true after callback

### Phase 4 — API Parity

- Recreate Python endpoints in Node with same routes and response shapes where practical:
  - `/api/cache/:boardId`
  - `/api/boards/:id/tags`
  - `/api/cards` (and related batch/shape routes if in use)
  - `/api/webhook`
- Implement services calling `miro.as(userId)` and repositories as needed

Acceptance:

- Integration tests covering equivalent FastAPI behavior pass
- Frontend can talk to Node API without code changes (or with minimal adapter)

### Phase 5 — Frontend Integration

- Switch frontend base URL to Node server
- Validate OAuth redirects and state handling through the app

Acceptance:

- Manual smoke test of key flows succeeds
- Frontend tests pass

### Phase 6 — Observability & Hardening

- Structured logs, request IDs, error mapping
- CORS, cookie security, CSRF (if required)
- Add `/healthz` and `/readyz`

Acceptance:

- Security checks and e2e smoke tests pass; coverage ≥ 90%

### Phase 7 — Cutover & Cleanup

- Update CI to build/test Node server, de-scope Python jobs
- Flag Python backend as legacy; remove after a stable period
- Update docs to reflect Node-only backend

Acceptance:

- CI green with Node-only; docs correct; no Python runtime required

## Risks & Mitigations

- Token storage correctness → robust unit tests, integration tests; align with Miro Storage semantics
- OAuth redirect issues → use local `.env`, verify redirect URLs in Miro app settings
- Data migration → back up `app.db` and run Prisma migrations in dry-run first
- Rate limits / API changes → use pagination helpers and backoff; centralize Miro calls

## Rollback

- Keep Python service intact on a separate branch/tag until Node backend is verified
- Retain `app.db` backups and migration scripts

## Acceptance Criteria (Summary)

- Node server replicates Python endpoints used by the frontend
- OAuth works end-to-end with persisted tokens
- Tests and coverage targets met; linters clean
- Documentation updated; AGENTS.md points to new Node architecture

