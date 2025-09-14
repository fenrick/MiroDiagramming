# Implementation Plan: Test Coverage Focus

This plan restructures existing work into a clear, actionable checklist. Each item states what is needed, where to change it, and a concrete definition of done. Items are grouped by priority and retain all previously listed work, expanded where useful.

## Priority 1 — Immediate

- Strengthen environment loader tests
    - Needed: Validate defaults and parsing (JSON vs CSV `CORS_ORIGINS`); assert invalid values (e.g., `PORT=0`, `QUEUE_CONCURRENCY=0`) produce clear errors.
    - Where: `src/config/env.ts`; new tests in `tests/config/env.test.ts`.
    - Definition of Done:
        - Tests assert defaults for `PORT`, queue settings, and `NODE_ENV` under minimal `.env`.
        - Tests cover both JSON array and CSV inputs for `CORS_ORIGINS`.
        - Negative cases (zero/negative numbers) throw with precise messages listing invalid fields.
        - File-level coverage for `src/config/env.ts` ≥ 90% lines/branches.

- Increase error handler coverage
    - Needed: Cover non-validation errors (custom `statusCode` and string `code`) and validation mapping to `INVALID_PAYLOAD`.
    - Where: `src/config/error-handler.ts`; tests in `tests/config/error-handler.test.ts` using a minimal Fastify app with the handler registered.
    - Definition of Done:
        - Asserts log call occurs and reply includes `{ error: { message, code? } }`.
        - Validation errors map to `400` with `code=INVALID_PAYLOAD`.
        - Non-validation errors return provided `statusCode` (fallback 500) and propagate string `code` if present.
        - File-level coverage for `src/config/error-handler.ts` ≥ 90%.

- Confirm coverage guard configuration
    - Needed: Enforce coverage thresholds in Vitest and ensure CI/local runs fail when thresholds are not met.
    - Where: `vitest.config.ts` (thresholds already present); ensure `package.json` scripts use coverage where appropriate and docs reference the 90% target per Quality Gates.
    - Definition of Done:
        - Thresholds at least: lines/statements/functions ≥ 90, branches ≥ 85 remain configured.
        - `npm run test` or `npm run coverage` fails when coverage drops below thresholds.
        - Coverage report (`coverage/`) is generated in V8 format and LCOV for CI.

## Priority 2 — Next

- Expand change queue tests
    - Needed: Cover `configure` clamping for negative/zero values; exercise retry and drop paths with fake timers and a stubbed `MiroService`; verify backoff + jitter logging shape without relying on real timing.
    - Where: `src/queue/changeQueue.ts`; tests in `tests/queue/changeQueue.test.ts`. Use `vi.useFakeTimers()` and spy on `MiroService.prototype.createNode` to force failures.
    - Definition of Done:
        - Tests assert `configure({ concurrency: 0, baseDelayMs: 0, maxDelayMs: < base> , maxRetries: 0 })` clamps to valid minimums.
        - Retry path: failing `createNode` re-enqueues with increasing attempts and logs a `task.retry` event including `backoffMs` and attempt count.
        - Drop path: exceeding `maxRetries` logs `task.dropped` and does not re-enqueue.
        - Logging assertions check for presence of keys, not exact timing.
        - File-level coverage for `src/queue/changeQueue.ts` ≥ 90%.

- Improve idempotency repository tests
    - Needed: Validate `cleanup` TTL cutoff logic via mocked `Date.now`; cover `get` and `set` behavior.
    - Where: `src/repositories/idempotencyRepo.ts`; tests in `tests/repositories/idempotencyRepo.test.ts` with `getPrisma` mocked to a test double.
    - Definition of Done:
        - `cleanup(ttl)` computes `cutoff = now - ttl*1000` and passes it to `deleteMany` as `{ created_at: { lt: cutoff } }`.
        - `set` performs an upsert with the expected shape; `get` returns `accepted` or `undefined` when not found.
        - No real database access occurs during tests; Prisma client is mocked.
        - File-level coverage for `src/repositories/idempotencyRepo.ts` ≥ 90%.

- Refactor server entrypoint for testability
    - Needed: Export `main()` and guard process start to avoid auto-start during tests; add a smoke test that imports without binding a port.
    - Where: `src/server.ts`; new tests in `tests/server/server.test.ts`.
    - Definition of Done:
        - `src/server.ts` exports `main` and only executes it when run directly (or `NODE_ENV !== 'test'`).
        - Importing the module in tests does not start a listener; smoke test passes in `NODE_ENV=test`.
        - Existing runtime behavior remains unchanged when starting via `node dist/server.js` or `npm run dev`.

- Strengthen typing in Miro integrations
    - Needed: Replace `Record<string, unknown>` in `MiroService` public APIs and internal shapes with SDK types or explicit DTOs for card creation and widget retrieval.
    - Where: `src/services/miroService.ts`; optionally introduce `src/services/dto.ts` for request/response DTOs if SDK types are insufficient.
    - Definition of Done:
        - Public method signatures avoid `any` and `Record<string, unknown>`; use `@mirohq/miro-api` types where available.
        - TypeScript strict mode passes without added `// @ts-ignore`.
        - Existing callers compile without type errors or are updated accordingly.

- Frontend SDK typing hygiene
    - Needed: Ensure Web SDK usage imports from `@mirohq/websdk-types`; eliminate untyped shapes in board utilities.
    - Where: `src/frontend/**/*.ts{,x}` (e.g., `board/*`, `core/*`); adjust local types where necessary.
    - Definition of Done:
        - No implicit `any` introduced; interfaces use Web SDK types.
        - `npm run typecheck` passes; eslint clean.

## Priority 3 — Later

- Adopt SDK pagination helpers consistently
    - Needed: Prefer async iterators (`for await ...`) from the Miro SDK where listing resources to simplify paging and reduce custom logic.
    - Where: Backend service methods that enumerate board resources (e.g., future iterations of `MiroService.getWidgets` if expanded) and any route/service performing list operations.
    - Definition of Done:
        - Listing code uses SDK-provided pagination helpers or async iterables.
        - Unit tests cover multi-page iteration behavior using mocks/stubs.

- Webhook utilities alignment
    - Needed: Monitor for an official Miro webhook signature helper; consider replacing custom `verifyWebhookSignature` to reduce maintenance when available.
    - Where: `src/utils/webhookSignature.ts`, `src/routes/webhook.routes.ts`.
    - Definition of Done:
        - If an official helper is adopted, parity tests confirm identical acceptance/rejection for a corpus of signed/unsigned payloads.
        - Documentation updated to reference the official helper and configuration.
