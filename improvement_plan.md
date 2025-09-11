# Improvement Plan

Purpose: a concise, ordered backlog of refactors and optimizations to keep the codebase simple, reliable, and easy to maintain.

Status markers: [Done] applied, [Planned] to do.

## 1) Config & Environment

1. Default port to 3000 [Done]
    - Why: align local URLs and app manifest; common dev default.
    - Acceptance: `PORT` defaults to 3000; docs/examples updated.

2. Simplify env schema with zod coercion [Done]
    - Why: remove fragile transforms and casts.
    - Acceptance: `z.coerce.number().int().positive().default(3000)` for `PORT`.

3. Centralize Miro env validation [Done]
    - Why: clear startup fail-fast for missing OAuth env when auth endpoints are used.
    - Acceptance: `getMiro()` calls use `loadEnv()` and throw a descriptive error when required vars are missing.

4. Startup logging and request.userId typing [Done]
    - Why: clearer boot diagnostics; remove repeated casts in routes.
    - Acceptance: log resolved port/env; add Fastify decorator for `request.userId` and update route handler types.

## 2) HTTP Server & Middleware

5. Webhook signature over raw body [Done]
    - Why: align with providers that sign exact bytes; reduce false negatives.
    - Acceptance: use raw body (e.g., `@fastify/raw-body`) and HMAC over bytes; integration test adjusted.

6. CORS/cookie hardening [Planned]
    - Why: secure defaults in production.
    - Acceptance: CORS allowlist via env; secure/sameSite cookies enforced in prod.

7. Readiness endpoint [Planned]
    - Why: health vs readiness split for orchestration.
    - Acceptance: `/readyz` checks DB connectivity and queue idle status.

## 3) Miro Integration

8. Use official client for REST calls [Done]
    - Why: centralize auth/refresh; reduce manual fetch and error plumbing.
    - Acceptance: `MiroService.createNode` uses `getMiro().as(userId).getBoard(boardId).createCardItem(...)`; removed `node-fetch`.

9. Error handling/backoff for Miro calls [Planned]
    - Why: consistent retry/backoff on 429/5xx.
    - Acceptance: shared helper wraps calls with exponential backoff and caps retries.

10. TokenStorage tests [Planned]

- Why: ensure storage meets client semantics.
- Acceptance: unit tests for get/set/delete paths.

## 4) Data & Prisma

11. Disconnect Prisma on shutdown [Done]

- Why: avoid dangling connections in dev/tests.
- Acceptance: `onClose` hook or exported `closePrisma()` used by tests.

12. Migrations & deployment flow [Done]

- Why: safe, repeatable schema changes.
- Acceptance: add `npm run migrate:deploy`; document running it in CI/prod; stop committing `app.db`.
- Notes: `.gitignore` now excludes `*.db`. Removing tracked DB files should be a separate maintenance task.

13. Indices and naming consistency [Planned]

- Why: performance and readability.
- Acceptance: composite unique/index for `Tag(board_id, name)`; consider `@map` to camelCase or standardize snake_case.

## 5) Queue/Worker

14. Concurrency + backoff + max retries [Done]

- Why: prevent infinite loops; improve throughput.
- Acceptance: configurable concurrency; exponential backoff; dead-letter or log after N failures.

15. Graceful shutdown [Done]

- Why: prevent task loss on exit.
- Acceptance: handle signals; stop intake; drain queue or persist tasks; log summary.

16. Structured task logs [Done]

- Why: observability.
- Acceptance: include task id, board id, type, retry count, duration.

## 6) API & Validation

17. Route schemas (zod/JSON schema) [Planned]

- Why: runtime validation and typed handlers.
- Acceptance: schemas for `/api/cards`, `/api/webhook`, etc.; automatic 400s on invalid input.

18. Unified error format [Planned]

- Why: predictable client handling.
- Acceptance: `{ error: { message, code? } }` across routes; consistent 4xx/5xx mapping.

19. Idempotency TTL cleanup [Planned]

- Why: bound storage growth.
- Acceptance: scheduled cleanup (e.g., daily) or age-based deletion.

## 7) Frontend

20. Sticky tagger caching and pre-scan [Done]

- Why: avoid duplicate tag creation/lookups; faster runs.
- Acceptance: single pre-scan ensures all tag names; per-sticky only applies IDs; strict text removal on success.

21. Invalidate board cache after mutations [Done]

- Why: avoid stale reads.
- Acceptance: call `boardCache.reset()` after mutative actions (e.g., sticky tags, layout, card creation).

22. Extract text read/write util [Planned]

- Why: DRY across search, sticky tagging, excel sync.
- Acceptance: shared helpers for getting/setting text fields; existing callers updated.

23. SDK guards + UX feedback [Planned]

- Why: better UX outside Miro; actionable feedback.
- Acceptance: central `ensureBoard()`; toast/snackbar for sticky tag results.

24. Tag client enhancement [Planned]

- Why: clear abstraction.
- Acceptance: optional `createTag(name)` wrapper (or backend endpoint later) and reuse across features.

## 8) Build & Tooling

25. Remove node-fetch; use global fetch [Planned]

- Why: reduce deps; Node 20 provides fetch.
- Acceptance: dependency removed; imports dropped; tests updated.

26. Husky prepare script [Done]

- Why: auto-install hooks on clone.
- Acceptance: add `"prepare": "husky"` and docs note.

27. ESLint rules refinement [Planned]

- Why: reduce unsafe patterns.
- Acceptance: rule to discourage `as unknown as`; prefer typed helpers.

## 9) Tests & Quality

28. Cards idempotency and tags route tests [Planned]

- Why: prevent regressions.
- Acceptance: integration tests for `/api/cards` idempotency and `/api/boards/:id/tags` mapping.

29. Sticky-tags unit tests [Planned]

- Why: lock behavior.
- Acceptance: tests covering multiple bracketed tags, duplicates, failure to create, and text stripping conditions.

30. Coverage guard [Planned]

- Why: maintain targets.
- Acceptance: simple threshold check (Vitest/c8) gating CI summary.

## 10) Docs & Cleanup

31. Webhook signature note [Done]

- Why: clarify raw body requirement.
- Acceptance: docs updated with implementation detail and env note.

32. Remove legacy references [Planned]

- Why: reduce confusion.
- Acceptance: purge Python-era remnants and stray references from README/DEPLOYMENT.

33. Commit hygiene for DB files [Done]

- Why: avoid shipping dev databases.
- Acceptance: ensure `.gitignore` covers `*.db`; remove committed `app.db` from repo history in a separate maintenance task if desired.

34. Prisma Client import guidance [Done]

- Why: make DB usage patterns explicit and consistent.
- Acceptance: README and node-architecture docs include import snippet and migration commands; Pulse tip added.

---

Execution guidance:

- Prefer small, reviewable PRs grouped by section above.
- Add/update tests alongside behavior changes.
- Keep changes minimal and avoid incidental refactors.
