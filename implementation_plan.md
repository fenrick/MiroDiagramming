# Implementation Plan: Test Coverage Focus

- Increase coverage for `src/config/error-handler.ts`
    - Add tests for non-validation errors (custom `statusCode` and `code`).
    - Keep validation error mapping to `INVALID_PAYLOAD` covered.

- Strengthen `src/config/env.ts` tests
    - Validate defaults and parsing (e.g., JSON vs CSV `CORS_ORIGINS`).
    - Verify invalid values (e.g., `PORT=0`, `QUEUE_CONCURRENCY=0`) cause a clear error.

- Add `src/miro/miroClient.ts` tests
    - Throw when required OAuth env vars missing.
    - Ensure singleton behavior (same instance returned on repeated calls).

- Expand `src/queue/changeQueue.ts` tests
    - Cover `configure` clamping for negative/zero values.
    - Exercise retry and drop paths with fake timers and a stubbed `MiroService`.
    - Verify backoff + jitter logging shape (assert keys present; avoid timing flakiness).

- Improve `src/repositories/idempotencyRepo.ts` tests
    - Cover `cleanup` TTL cutoff logic by mocking `Date.now`.

- Consider refactoring `src/server.ts` for testability
    - Export `main()` and guard execution so it doesn’t auto-start under tests.
    - Add a minimal smoke test that imports without binding to a fixed port.

- Add coverage guard
    - Introduce thresholds in Vitest config (e.g., statements/lines >= 80%).
