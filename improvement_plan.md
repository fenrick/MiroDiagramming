# Improvement Plan

Purpose: a concise, ordered backlog of refactors and optimizations to keep the codebase simple, reliable, and easy to maintain.

Status markers: [Planned] to do. Completed items are removed from this list once merged.

## Quick Wins (Backend)

1. DRY OAuth routes [Planned]
    - Why: eliminate duplicate callback/login handlers.
    - Acceptance: single callback/login handlers used by both `/auth/miro/*` and `/oauth/*` aliases.

2. SPA fallback helper (dev/prod) [Planned]
    - Why: avoid drift between dev Vite middleware and prod static serving.
    - Acceptance: shared helper used in both branches; tests updated if needed.

3. Vite dev wiring isolation [Planned]
    - Why: clarify responsibilities; lighten `app.ts`.
    - Acceptance: dev middleware moved to `config/dev-vite.ts` (lazy import); behavior unchanged.

## Security, Resilience, Logging

4. Queue configurability via env [Planned]
    - Why: tune concurrency/backoff without code changes.
    - Acceptance: `QUEUE_CONCURRENCY`, `QUEUE_MAX_RETRIES`, `QUEUE_BASE_DELAY_MS`, `QUEUE_MAX_DELAY_MS` parsed in `env.ts` and applied.

5. Unify logging under Fastify logger [Planned]

- Why: consistent redaction and correlation.
- Acceptance: queues/services receive `app.log` (or adapter) instead of creating separate pino instances.

## Database

6. Index for idempotency cleanup [Planned]

- Why: speed up deletion by age.
- Acceptance: Prisma migration adding index on `IdempotencyEntry.created_at`.

## Frontend

7. Backend boundary for board reads [Planned]

- Why: reduce client API calls; improve testability.
- Acceptance: minimal backend endpoints added; `shape-client`/`board-cache` progressively switched to server-backed lookups.

8. BoardBuilder testability [Planned]

- Why: easier unit tests and reuse.
- Acceptance: inject board-like dependency into `loadShapeMap`; extract `runBatch` utility.

9. Improve error messages [Planned]

- Why: faster debugging.
- Acceptance: errors include invalid values/context across builder operations.

## Docs & Inline Comments

10. JSDoc and inline docs across key files [Planned]

- app.ts: server composition, cookie rationale, SPA fallback.
- env.ts: per-variable docs, examples, security notes (incl. `MIRO_WEBHOOK_SECRET`).
- webhook.routes.ts: signature algorithm and raw-body requirement.
- queue/changeQueue.ts: concurrency model, backoff, drop policy.
- miro/tokenStorage.ts: mapping to Prisma `User`, expire semantics, `set(undefined)`.
- services/miroService.ts: inputs/outputs and idempotency expectations.
- frontend/board/board-builder.ts: metadata assumptions, `runBatch` behavior.

## Lint, Tests & Quality

11. ESLint rules refinement [Planned]

- Why: reduce unsafe casts.
- Acceptance: discourage `as unknown as`; prefer typed helpers or module augmentation.

12. Tests for idempotency and tags lookup [Planned]

- Why: prevent regressions.
- Acceptance: integration tests for `/api/cards` idempotency and `/api/boards/:id/tags` OR mapping.

13. Webhook signature util tests [Planned]

- Why: verify timing-safe logic.
- Acceptance: unit tests covering valid/invalid signature paths with raw body.

14. Coverage guard [Planned]

- Why: maintain targets.
- Acceptance: threshold check (Vitest/c8) gating CI summary.

---

Execution guidance:

- Prefer small, reviewable PRs grouped by section above.
- Add/update tests alongside behavior changes.
- Keep changes minimal and avoid incidental refactors.
