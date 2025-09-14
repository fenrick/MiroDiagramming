# Implementation Plan

Purpose: Track pending improvements and code quality actions. Do not remove items; mark them done as completed. Each item lists what’s needed, where it applies, and the definition of done (DoD).

## Architecture & Lifecycle

- Export `createServer()` for tests
    - What’s needed: Expose a function to build the Fastify app without binding a port; have `startServer()` consume it.
    - Where: `src/server.ts` (create/export `createServer`; refactor `startServer`).
    - DoD: Integration tests can import `createServer()` and run requests without port binding; no behavior change for production start.

- Guard auto-start in entrypoint
    - What’s needed: Only auto-start server when the file is executed directly.
    - Where: `src/server.ts` using `if (require.main === module) { startServer() }`.
    - DoD: Running tests that import the module does not start a listener.

- Graceful shutdown on SIGTERM/SIGINT
    - What’s needed: Signal handlers that `await app.close()` and stop background workers; make sure Fastify onClose hooks run.
    - Where: `src/server.ts` (signal handlers), `src/queue/changeQueue.ts` (stop hook if needed).
    - DoD: Sending SIGINT/SIGTERM closes the server cleanly and calls `changeQueue.stop()`; verified by lifecycle test.

- Health endpoints (liveness/readiness)
    - What’s needed: Add `/healthz/live` simple OK and `/healthz/ready` that checks DB and exposes queue stats; ensure SPA fallback excludes `/healthz`.
    - Where: `src/routes/health.routes.ts` (new), register in `src/app.ts`; ensure SPA fallback exclusion remains.
    - DoD: Hitting `/healthz/live` returns `{status:'ok'}`; `/healthz/ready` returns DB status and queue metrics, 503 on DB failure.

- Server lifecycle integration test
    - What’s needed: Start server/app, hit `/healthz`, then trigger shutdown and assert queue stop called.
    - Where: `tests/integration/server/lifecycle.test.ts`.
    - DoD: Test passes reliably and guards start/stop regressions.

## Queue & Persistence

- Persist pending `changeQueue` tasks
    - What’s needed: Store tasks via Prisma/SQLite to survive restarts; decide purge semantics.
    - Where: `src/queue/changeQueue.ts` (persistence), `prisma/schema.prisma` (if schema changes), `src/config/db` utilities.
    - DoD: Tasks survive process restarts per documented policy; migration present; tests cover enqueue/dequeue and recovery.

- Queue instrumentation and backpressure
    - What’s needed: Structured logs for enqueue/dequeue with size/in-flight; WARN when length exceeds soft limit; limit configurable.
    - Where: `src/queue/changeQueue.ts`; configuration via env (e.g., `QUEUE_WARN_LENGTH`).
    - DoD: Logs show metrics; WARN triggers above threshold; threshold controlled by env.

- Ensure queue drains on shutdown
    - What’s needed: Stop processing cleanly and drain backlog or persist state on shutdown.
    - Where: `src/queue/changeQueue.ts` and lifecycle in `src/server.ts`.
    - DoD: Test verifies no tasks lost or left stuck; shutdown completes.

## Miro API & Webhooks

- Backoff jitter and Retry-After support
    - What’s needed: Add jitter to exponential backoff and honor `Retry-After` header.
    - Where: `src/miro/retry.ts` (or equivalent retry helper).
    - DoD: Retries wait per header when provided; otherwise exponential with jitter; logs reflect backoff choice.

- Use SDK async iterators for listings
    - What’s needed: Refactor list operations to `for await (...)` and update docs with example.
    - Where: `src/services/miroService.ts`; docs in `docs/node-architecture.md`.
    - DoD: Listings stream via async iteration; unit/integration tests continue to pass; docs updated.

- Replace custom webhook signature verify (when SDK ready)
    - What’s needed: Swap `src/utils/webhookSignature.ts` for official SDK helper; adjust tests.
    - Where: `src/utils/webhookSignature.ts`, webhook route, and related tests.
    - DoD: Webhook verification uses SDK; tests green; fallback plan documented until helper is available.

## Type Safety & SDK Usage

- Replace broad `Record<string, unknown>`
    - What’s needed: Use SDK types or explicit DTOs instead of wide records.
    - Where: `src/services/miroService.ts` (and any similar services).
    - DoD: No `Record<string, unknown>` in service APIs; types validated by tsc and tests.

- Import frontend SDK types
    - What’s needed: Use `@mirohq/websdk-types` in frontend code.
    - Where: `src/frontend/**`.
    - DoD: Frontend compiles with stronger typing; no implicit anys in these areas.

- Enable `noImplicitAny`
    - What’s needed: Turn on `noImplicitAny` and resolve resulting errors.
    - Where: `tsconfig.json`, `tsconfig.client.json` and code fixes across `src/**` as needed.
    - DoD: Typecheck passes with `noImplicitAny` enabled.

- Define shared DTOs
    - What’s needed: Centralize request/response DTOs shared by backend and frontend.
    - Where: `src/types/` (new or expanded module).
    - DoD: Imports use shared DTOs; duplication removed; typecheck and tests pass.

## Security

- Security headers via Helmet
    - What’s needed: Register `@fastify/helmet` with sensible defaults; disable in tests.
    - Where: `src/app.ts` (conditional on `NODE_ENV !== 'test'`).
    - DoD: Responses include standard security headers in non-test envs; no breakage observed.

- Tighten webhook content-type and size
    - What’s needed: Enforce `application/json`, set small `bodyLimit`, keep `rawBody` enabled for signature check.
    - Where: `src/routes/webhook.routes.ts` (route options/schema).
    - DoD: Route rejects invalid content types/oversized bodies; existing webhook tests pass.

- Redact sensitive fields in logs
    - What’s needed: Extend logger redaction to headers and tokens.
    - Where: `src/config/logger.ts` (`redact.paths` to include `req.headers['x-miro-signature']`, `req.headers.cookie`, `req.headers.authorization`).
    - DoD: Logs show `[Redacted]` for configured fields; no secrets leak in app logs.

## Reliability & Operations

- Liveness/readiness endpoints (see Architecture & Lifecycle)
    - What’s needed: As specified above; expose DB and queue state.
    - Where: `src/routes/health.routes.ts`, `src/app.ts`.
    - DoD: Ready for orchestration probes; correct status codes returned.

- Queue backpressure visibility (see Queue & Persistence)
    - What’s needed: Metrics and WARN thresholds.
    - Where: `src/queue/changeQueue.ts`.
    - DoD: Logs/metrics available for monitoring.

## Testing & Coverage

- Env var error handling tests
    - What’s needed: Tests for missing required envs throwing descriptive errors; tests for default `PORT` and JSON array parsing.
    - Where: `src/config/env.test.ts`.
    - DoD: Tests pass and cover edge cases for env parsing and defaults.

- Error handler coverage
    - What’s needed: Cover non-validation error paths; verify custom HTTP codes and response shapes.
    - Where: `src/config/error-handler.test.ts`.
    - DoD: Tests assert correct codes/payloads for various error types.

- Change queue behavior tests
    - What’s needed: Mock timers to test clamping, retry/drop flows, backoff logging; verify queue drains on shutdown.
    - Where: `src/queue/changeQueue.test.ts` and lifecycle-related tests.
    - DoD: All queue scenarios covered; shutdown drain verified.

- Idempotency repository TTL tests
    - What’s needed: Mock `Date.now` to verify TTL cleanup; confirm duplicate keys extend TTL.
    - Where: `src/repositories/idempotencyRepo.test.ts`.
    - DoD: TTL behavior validated; duplicates extend TTL as expected.

- Client tests stability
    - What’s needed: Fix timeouts in `search-tab` tests for debounced search and clear-query; fix parsing issues in `style-presets` tests (ensure JSDOM env, correct ESM/JSX handling, proper `.tsx`).
    - Where: `tests/client/search-tab.test.tsx`, `tests/client/style-presets.test.ts[x]`.
    - DoD: `npm test` runs without Vitest parse failures and flake-free timeouts.

- Coverage thresholds in Vitest
    - What’s needed: Set `test.coverage.thresholds` for statements/branches/functions/lines ≥ 80; add CI coverage run that fails below thresholds.
    - Where: `vitest.config.ts`, `.github/workflows/ci.yml` (coverage step).
    - DoD: Local and CI runs fail if coverage drops below thresholds; coverage report generated.

- Note on Quality Gates alignment
    - What’s needed: Plan to raise thresholds to meet project Quality Gates (target ≥ 90%).
    - Where: `vitest.config.ts` follow-up change tracked in `improvement_plan.md` when ready.
    - DoD: Thresholds eventually updated to ≥ 90% with tests supporting the increase.

## Linting & Formatting

- Expand lint script scope
    - What’s needed: Lint `src/frontend/`, `tests/`, and `scripts/`; fail on warnings.
    - Where: `package.json` (`scripts.lint`).
    - DoD: `npm run lint` covers all paths and exits non-zero on warnings.

- Fix ESLint warnings and parsing issues
    - What’s needed: Resolve lints across tests and client code, especially around JSX/ESM parsing in style presets test.
    - Where: Codebase-wide; specifically `tests/client/style-presets.test.ts[x]`.
    - DoD: `npm run lint` clean with zero warnings.

- Maintain formatting
    - What’s needed: Run formatter and ensure consistent Prettier config applied.
    - Where: Project root via `npm run format:write` (or equivalent).
    - DoD: Formatting stable and enforced in CI if configured.

## Developer Experience

- Production Dockerfile
    - What’s needed: Multi-stage build (builder → runner) on `node:20-alpine`; build Vite + tsc; run with `node dist/server.js`.
    - Where: `Dockerfile` at repo root; adjust `package.json` scripts if needed.
    - DoD: `docker build` succeeds; `docker run -p 3000:3000` serves the app.

- Authoritative `.env.example`
    - What’s needed: List all required/optional env vars with comments (e.g., `PORT`, `DATABASE_URL`, `MIRO_CLIENT_ID/SECRET/REDIRECT_URL`, `MIRO_WEBHOOK_SECRET`, `QUEUE_*`, any `SESSION_*`).
    - Where: `.env.example` at repo root.
    - DoD: New contributors can `cp .env.example .env` and boot the app without guesswork.

## Documentation

- Keep improvement plan current
    - What’s needed: Remove completed items from `improvement_plan.md` per AGENTS guidance.
    - Where: `improvement_plan.md`.
    - DoD: Only pending work remains listed; updated alongside related PRs.

- Document server refactor and lifecycle
    - What’s needed: Describe `createServer`, start/stop, and signal handling.
    - Where: `docs/node-architecture.md`.
    - DoD: Docs include lifecycle & signals section; reflects implemented behavior.

- Document queue persistence strategy
    - What’s needed: Capture persistence design, trade-offs, and operational notes.
    - Where: `docs/node-architecture.md`.
    - DoD: Clear section explaining persistence choices and recovery.

- Operational runbook
    - What’s needed: Create `docs/runbook.md` covering env vars, health endpoints, graceful shutdown, queue metrics, and secret rotation basics.
    - Where: `docs/runbook.md` (new).
    - DoD: Runbook exists and is referenced by deployment docs.

- Update retry semantics in docs
    - What’s needed: Add jitter/Retry-After behavior and queue limits/telemetry to docs.
    - Where: `docs/node-architecture.md`.
    - DoD: Documentation reflects current retry and telemetry patterns.

## Style Guide Compliance

- Enforce ESLint rules per style guide
    - What’s needed: Configure rules `consistent-type-imports`, `import/order`, `import/no-default-export` (allow exceptions for Vite/CLI), `@typescript-eslint/no-floating-promises`, `@typescript-eslint/explicit-module-boundary-types`, `no-console` (allow in scripts), `curly`, `eqeqeq`.
    - Where: `eslint.config.mjs` (or `.eslintrc.*`).
    - DoD: `npm run lint` passes and catches violations; CI enforces the rules.

- Add React linting plugins
    - What’s needed: Add `eslint-plugin-react` and `eslint-plugin-react-hooks` with recommended configs for files under `src/frontend/**`.
    - Where: `package.json` devDependencies and `eslint.config.mjs`.
    - DoD: Frontend lint catches hook rule violations and JSX best practices.

- Require TSDoc on exported APIs
    - What’s needed: Add `eslint-plugin-tsdoc` and enable errors for invalid/missing TSDoc on exported functions/classes.
    - Where: `package.json` (devDependency) and `eslint.config.mjs`.
    - DoD: Lint fails on missing/invalid TSDoc; key modules documented.

- Prefer named exports internally
    - What’s needed: Refactor modules using default exports to named exports where feasible; add allowlist for required defaults (Vite entry, CLI).
    - Where: `src/**` modules with default export.
    - DoD: No default exports remain except allowlisted; lint passes.

- TypeScript strictness flags
    - What’s needed: Ensure `tsconfig.json` and `tsconfig.client.json` enable `noImplicitAny`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `useUnknownInCatchVariables`, `noPropertyAccessFromIndexSignature`.
    - Where: `tsconfig.json`, `tsconfig.client.json`.
    - DoD: `npm run typecheck` passes with flags enabled.

- Absolute import paths
    - What’s needed: Configure `baseUrl` and `paths` for absolute imports; add lint guard to discourage deep relative paths; migrate imports gradually.
    - Where: `tsconfig.json`, `eslint.config.mjs`, code in `src/**`.
    - DoD: New code uses absolute imports; lint warns on long relative paths; initial migration completed.

- Husky pre-commit runs lint
    - What’s needed: Extend the pre-commit hook to run `npm run lint` in addition to Prettier check.
    - Where: `.husky/pre-commit`.
    - DoD: Commits are blocked on lint errors locally.

- No non-null assertions
    - What’s needed: Enable `@typescript-eslint/no-non-null-assertion` and refactor code to use guards/narrowing.
    - Where: `eslint.config.mjs`, code in `src/**`.
    - DoD: Lint clean with rule enabled; code uses safe checks.

- Backend input validation with Zod
    - What’s needed: Ensure all externally-sourced inputs (routes, webhooks, env parsing) validate via Zod or JSON Schema.
    - Where: `src/routes/**`, `src/utils/**`, `src/config/env.ts`.
    - DoD: Handlers parse inputs before use; tests cover invalid input cases.

- Frontend component/file naming
    - What’s needed: Audit and align filenames to `PascalCase.tsx` for components, `kebab-case.ts` for utilities.
    - Where: `src/frontend/**`.
    - DoD: Naming matches guide; imports updated; build and tests pass.

- Logger usage policy
    - What’s needed: Replace stray `console.*` in app code with the shared logger; ensure redaction covers sensitive headers/tokens.
    - Where: `src/**` (app code), `src/config/logger.ts`.
    - DoD: No `console.*` in app code (scripts allowed); redaction list updated and verified.

- Promise handling hygiene
    - What’s needed: Fix floating promises by awaiting or explicitly marking `void` for fire‑and‑forget handlers.
    - Where: `src/**` where async is used.
    - DoD: Lint clean for `no-floating-promises`; tests unaffected.
