# Improvement Plan

Purpose: a concise, ordered backlog of refactors and optimizations to keep the codebase simple, reliable, and easy to maintain.

Status markers: [Planned] to do. Completed items are removed from this list once merged.

## Quick Wins (Backend)

1. Type-safe `request.userId` [Planned]
    - Why: remove repeated casts in routes and hooks.
    - Acceptance: module augmentation for FastifyRequest; all routes use `req.userId` without casts.

2. Centralize env usage for webhook/signature/logging [Planned]
    - Why: avoid `process.env` reads scattered in code.
    - Acceptance: `src/config/env.ts` includes `MIRO_WEBHOOK_SECRET`, `LOG_LEVEL`; `webhook.routes.ts` uses `loadEnv()`.

3. Constant-time webhook signature compare [Planned]
    - Why: prevent timing attacks; follow best practices.
    - Acceptance: `timingSafeEqual` used on computed HMAC vs header; raw-body retained.

4. DRY OAuth routes [Planned]
    - Why: eliminate duplicate callback/login handlers.
    - Acceptance: single callback/login handlers used by both `/auth/miro/*` and `/oauth/*` aliases.

5. SPA fallback helper (dev/prod) [Planned]
    - Why: avoid drift between dev Vite middleware and prod static serving.
    - Acceptance: shared helper used in both branches; tests updated if needed.

6. Cards route polish [Planned]
    - Why: simplify and harden request handling.
    - Acceptance: lowercased `idempotency-key` util; payload whitelisted to expected fields; `randomUUID()` for `nodeId`; empty array fast-path.

7. Tags lookup simplification [Planned]
    - Why: reduce branching/readability.
    - Acceptance: single Prisma `OR` query handling numeric `id` or string `board_id`.

8. Vite dev wiring isolation [Planned]
    - Why: clarify responsibilities; lighten `app.ts`.
    - Acceptance: dev middleware moved to `config/dev-vite.ts` (lazy import); behavior unchanged.

## Security, Resilience, Logging

9. Queue configurability via env [Planned]
    - Why: tune concurrency/backoff without code changes.
    - Acceptance: `QUEUE_CONCURRENCY`, `QUEUE_MAX_RETRIES`, `QUEUE_BASE_DELAY_MS`, `QUEUE_MAX_DELAY_MS` parsed in `env.ts` and applied.

10. Unify logging under Fastify logger [Planned]

- Why: consistent redaction and correlation.
- Acceptance: queues/services receive `app.log` (or adapter) instead of creating separate pino instances.

## Database

11. Index for idempotency cleanup [Planned]

- Why: speed up deletion by age.
- Acceptance: Prisma migration adding index on `IdempotencyEntry.created_at`.

## Frontend

12. Backend boundary for board reads [Planned]

- Why: reduce client API calls; improve testability.
- Acceptance: minimal backend endpoints added; `shape-client`/`board-cache` progressively switched to server-backed lookups.

13. BoardBuilder testability [Planned]

- Why: easier unit tests and reuse.
- Acceptance: inject board-like dependency into `loadShapeMap`; extract `runBatch` utility.

14. Improve error messages [Planned]

- Why: faster debugging.
- Acceptance: errors include invalid values/context across builder operations.

## Docs & Inline Comments

15. JSDoc and inline docs across key files [Planned]

- app.ts: server composition, cookie rationale, SPA fallback.
- env.ts: per-variable docs, examples, security notes (incl. `MIRO_WEBHOOK_SECRET`).
- webhook.routes.ts: signature algorithm and raw-body requirement.
- queue/changeQueue.ts: concurrency model, backoff, drop policy.
- miro/tokenStorage.ts: mapping to Prisma `User`, expire semantics, `set(undefined)`.
- services/miroService.ts: inputs/outputs and idempotency expectations.
- routes/cards.routes.ts: schema intent, idempotency header semantics, honored fields.
- frontend/board/board-builder.ts: metadata assumptions, `runBatch` behavior.

## Lint, Tests & Quality

16. ESLint rules refinement [Planned]

- Why: reduce unsafe casts.
- Acceptance: discourage `as unknown as`; prefer typed helpers or module augmentation.

17. Tests for idempotency and tags lookup [Planned]

- Why: prevent regressions.
- Acceptance: integration tests for `/api/cards` idempotency and `/api/boards/:id/tags` OR mapping.

18. Webhook signature util tests [Planned]

- Why: verify timing-safe logic.
- Acceptance: unit tests covering valid/invalid signature paths with raw body.

19. Coverage guard [Planned]

- Why: maintain targets.
- Acceptance: threshold check (Vitest/c8) gating CI summary.

---

Execution guidance:

- Prefer small, reviewable PRs grouped by section above.
- Add/update tests alongside behavior changes.
- Keep changes minimal and avoid incidental refactors.
