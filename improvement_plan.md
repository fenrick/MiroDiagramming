# Improvement Plan

Purpose: a concise, ordered backlog of refactors and optimizations to keep the codebase simple, reliable, and easy to maintain.

Status markers: [Planned] to do. Completed items are removed from this list once merged.

## Frontend

- Backend boundary for board reads [Planned]

- Why: reduce client API calls; improve testability.
- Acceptance: minimal backend endpoints added; `shape-client`/`board-cache` progressively switched to server-backed lookups.

- BoardBuilder testability [Planned]

- Why: easier unit tests and reuse.
- Acceptance: inject board-like dependency into `loadShapeMap`; extract `runBatch` utility.

- Improve error messages [Planned]

- Why: faster debugging.
- Acceptance: errors include invalid values/context across builder operations.

## Docs & Inline Comments

- JSDoc and inline docs across key files [Planned]

- app.ts: server composition, cookie rationale, SPA fallback.
- webhook.routes.ts: signature algorithm and raw-body requirement.
- miro/tokenStorage.ts: mapping to Prisma `User`, expire semantics, `set(undefined)`.
- services/miroService.ts: inputs/outputs and idempotency expectations.
- frontend/board/board-builder.ts: metadata assumptions, `runBatch` behavior.

## Lint, Tests & Quality

- ESLint rules refinement [Planned]

- Why: reduce unsafe casts.
- Acceptance: discourage `as unknown as`; prefer typed helpers or module augmentation.

- Tests for idempotency and tags lookup [Planned]

- Why: prevent regressions.
- Acceptance: integration tests for `/api/cards` idempotency and `/api/boards/:id/tags` OR mapping.

- Webhook signature util tests [Planned]

- Why: verify timing-safe logic.
- Acceptance: unit tests covering valid/invalid signature paths with raw body.

- Coverage guard [Planned]

- Why: maintain targets.
- Acceptance: threshold check (Vitest/c8) gating CI summary.

---

Execution guidance:

- Prefer small, reviewable PRs grouped by section above.
- Add/update tests alongside behavior changes.
- Keep changes minimal and avoid incidental refactors.
