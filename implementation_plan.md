# Implementation Plan: Test Coverage Focus

## Priority 1 — Immediate

- Strengthen `src/config/env.ts` tests
    - Validate defaults and parsing (e.g., JSON vs CSV `CORS_ORIGINS`).
    - Verify invalid values (e.g., `PORT=0`, `QUEUE_CONCURRENCY=0`) cause a clear error.

- Increase coverage for `src/config/error-handler.ts`
    - Add tests for non-validation errors (custom `statusCode` and `code`).
    - Keep validation error mapping to `INVALID_PAYLOAD` covered.

- Add coverage guard
    - Introduce thresholds in Vitest config (e.g., statements/lines >= 80%).

## Priority 2 — Next

- Expand `src/queue/changeQueue.ts` tests
    - Cover `configure` clamping for negative/zero values.
    - Exercise retry and drop paths with fake timers and a stubbed `MiroService`.
    - Verify backoff + jitter logging shape (assert keys present; avoid timing flakiness).

- Improve `src/repositories/idempotencyRepo.ts` tests
    - Cover `cleanup` TTL cutoff logic by mocking `Date.now`.

- Consider refactoring `src/server.ts` for testability
    - Export `main()` and guard execution so it doesn’t auto-start under tests.
    - Add a minimal smoke test that imports without binding to a fixed port.

- Strengthen typing in Miro integrations
    - Replace `Record<string, unknown>` in `MiroService` with SDK-provided types where available (e.g., board, card item creation payloads).
    - Prefer explicit DTOs if SDK types are not exported to keep API contracts clear.

- Frontend SDK typing hygiene
    - Ensure Web SDK usage references `@mirohq/websdk-types` where applicable and avoid `any`/loose shapes in board utilities.

## Priority 3 — Later

- Adopt SDK pagination helpers consistently
    - Use async iterators (`for await ...`) provided by the SDK when listing resources to simplify paging and reduce custom logic.

- Webhook utilities alignment
    - Monitor for an official Miro webhook signature helper; replace custom `verifyWebhookSignature` when available to reduce maintenance.
