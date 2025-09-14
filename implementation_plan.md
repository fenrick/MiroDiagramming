# Implementation Plan

Purpose: Track pending improvements and code quality actions. Do not remove items; mark them done as completed. Each item lists what’s needed, where it applies, and the definition of done (DoD).

## Server Architecture & Lifecycle

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

- Domain error classes and mapping
    - What’s needed: Define lightweight domain error classes with machine-readable `code` and centralize mapping to HTTP statuses (400/401/403/409/429) in the error handler.
    - Where: `src/config/error-response.ts`, `src/config/error-handler.ts`, thrown from services/routes.
    - DoD: Errors include codes; centralized handler maps to correct status/payload; tests assert mappings.

## Reliability & Operations

- Liveness and readiness endpoints exposed for orchestration
    - What’s needed: Provide `/healthz/live` and `/healthz/ready` endpoints suitable for Kubernetes/Docker health checks; readiness should verify DB connectivity and expose queue stats; ensure SPA fallback excludes `/healthz/*`.
    - Where: `src/routes/health.routes.ts` (new), registered in `src/app.ts` with SPA exclusion.
    - DoD: `/healthz/live` returns `{ status: 'ok' }` with 200; `/healthz/ready` returns structured object including DB status and queue metrics, returns 503 on DB failure.

- Queue backpressure visibility for operations
    - What’s needed: Emit structured logs/metrics for queue size and in‑flight counts; log WARN when queue length crosses a soft threshold; threshold configurable by env.
    - Where: `src/queue/changeQueue.ts`; configuration via env (e.g., `QUEUE_WARN_LENGTH`).
    - DoD: Logs contain queue metrics; WARN fires above threshold; threshold adjusted via env var.

- Server lifecycle integration coverage
    - What’s needed: Integration test that starts the app, probes health endpoints, triggers SIGINT/SIGTERM, and verifies queue stop/drain and Fastify onClose hooks.
    - Where: `tests/integration/server/lifecycle.test.ts`.
    - DoD: Test reliably passes and prevents regressions in start/stop behavior.

## Queue & Persistence

- Persist pending `changeQueue` tasks across restarts
    - What’s needed: Store enqueued tasks in Prisma/SQLite with minimal schema; define purge/TTL semantics and recovery order.
    - Where: `src/queue/changeQueue.ts` (persistence integration), `prisma/schema.prisma` (schema/migration), `src/config/db` helpers.
    - DoD: Tasks survive process restarts per documented policy; migration included; tests cover enqueue, dequeue, recovery on boot, and purge behavior.

- Ensure queue drains or persists on shutdown
    - What’s needed: On shutdown, stop accepting new work, finish in‑flight items, and either drain backlog or persist state for resumption.
    - Where: `src/queue/changeQueue.ts` and server lifecycle in `src/server.ts`.
    - DoD: Tests prove no tasks are lost or stuck; shutdown completes cleanly within a bounded time.

- Instrument queue and apply backpressure
    - What’s needed: Structured logging for enqueue/dequeue with sizes and latencies; configurable concurrency; soft/hard limits with clamped enqueue or shedding if needed.
    - Where: `src/queue/changeQueue.ts`; env config for limits/concurrency.
    - DoD: Logs/metrics available; WARN/ERROR at thresholds; behavior configurable via env.

## Miro API & Webhooks

- Backoff jitter and Retry‑After support
    - What’s needed: Add full jitter to exponential backoff and honor `Retry-After` header values (seconds/date); respect 429/5xx semantics.
    - Where: `src/miro/retry.ts` (or retry helper), with logging of chosen delay and reason.
    - DoD: Retries wait per header when provided; otherwise exponential with jitter; logs include backoff details; unit tests cover both flows.

- Use SDK async iterators for listings
    - What’s needed: Replace manual pagination with `for await (...)` over SDK iterators; include example in docs.
    - Where: `src/services/miroService.ts`; documentation in `docs/node-architecture.md`.
    - DoD: List operations stream via async iteration; tests still pass; docs updated with example usage.

- Replace custom webhook signature verification (when SDK helper available)
    - What’s needed: Swap `src/utils/webhookSignature.ts` for official SDK helper, adjust route wiring and tests accordingly; keep fallback until helper is released.
    - Where: `src/utils/webhookSignature.ts`, webhook route, and related tests.
    - DoD: Verification uses SDK helper; tests green; fallback path documented until rollout.

## Type Safety & SDK Usage

- Replace broad `Record<string, unknown>` usage
    - What’s needed: Adopt precise SDK types or explicit DTOs in public/service APIs; remove wide index signatures.
    - Where: `src/services/miroService.ts` and similar services.
    - DoD: No `Record<string, unknown>` in service APIs; typecheck and tests validate correctness.

- Import frontend SDK types
    - What’s needed: Use `@mirohq/websdk-types` in frontend components/hooks for stronger typing.
    - Where: `src/frontend/**`.
    - DoD: Frontend compiles with stronger typing; no implicit anys in these areas.

- Enable `noImplicitAny`
    - What’s needed: Turn on `noImplicitAny` and resolve resulting errors across backend and frontend.
    - Where: `tsconfig.json`, `tsconfig.client.json`, and code in `src/**`.
    - DoD: `npm run typecheck` passes with `noImplicitAny` enabled.

- Define shared DTOs
    - What’s needed: Centralize request/response DTOs shared by backend and frontend.
    - Where: `src/types/` (new or expanded module); refactor imports to use shared DTOs.
    - DoD: Duplication removed; typecheck and tests pass.

- Frontend Miro SDK adapter (no globals)
    - What’s needed: Introduce a `BoardAdapter` wrapper for Miro SDK access and inject it where needed to avoid direct `globalThis` references.
    - Where: `src/frontend/board/board-adapter.ts` (new), refactors in `src/frontend/**`.
    - DoD: All SDK calls go through adapter; tests stub adapter; no direct global casts remain.

## Linting & Formatting

- Expand lint script scope
    - What’s needed: Lint `src/frontend/`, `tests/`, and `scripts/`; fail on warnings to keep signal strong.
    - Where: `package.json` (`scripts.lint`).
    - DoD: `npm run lint` covers all paths and exits non‑zero on warnings.

- Fix ESLint warnings and parsing issues
    - What’s needed: Resolve lints across tests and client code, especially JSX/ESM parsing in style‑presets tests.
    - Where: Codebase‑wide; specifically `tests/client/style-presets.test.ts[x]`.
    - DoD: `npm run lint` clean with zero warnings.

- Maintain formatting
    - What’s needed: Ensure Prettier config is applied consistently; run formatter in CI/local.
    - Where: Project root via `npm run format:write` (or equivalent).
    - DoD: Formatting stable and enforced where configured.

- Type-only imports enforcement
    - What’s needed: Enable and auto-fix `consistent-type-imports` to prefer `import type` for types; migrate existing imports.
    - Where: `eslint.config.mjs`; code in `src/**`, `tests/**`.
    - DoD: No mixed type/value imports; lint clean for consistent-type-imports.

- Import order: alphabetize + internal groups
    - What’s needed: Configure `import/order` to alphabetize within groups and recognize internal aliases (`@/*` or `src/*`) via `pathGroups`.
    - Where: `eslint.config.mjs`.
    - DoD: Imports are grouped and alphabetized; no import/order warnings.

- Import hygiene: cycles and extraneous deps
    - What’s needed: Add `import/no-cycle` and `import/no-extraneous-dependencies` with sensible overrides; fix any violations.
    - Where: `eslint.config.mjs`, `package.json` adjustments as needed.
    - DoD: Lint passes with no cycles or extraneous dependency errors.

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

- Husky pre‑commit runs lint
    - What’s needed: Extend the pre‑commit hook to run `npm run lint` in addition to Prettier check.
    - Where: `.husky/pre-commit`.
    - DoD: Commits are blocked on lint errors locally.

## Aura UX Alignment (Frontend)

- Sections, spacing, and rhythm [Done]
    - What’s needed: Unified SidebarSection padding and row gaps; ScrollArea vertical padding; stable scrollbars; list spacing.
    - Where: `src/frontend/ui/components/SidebarSection.tsx`, `ScrollArea.tsx`, `assets/style.css`.
    - DoD: Consistent vertical rhythm across tabs; no cramped sections; lists and callouts scan cleanly.

- Empty/Loading states [Done]
    - What’s needed: EmptyState for empty views; Skeleton for long operations (imports, jobs, cards).
    - Where: `src/frontend/ui/components/{EmptyState,Skeleton}.tsx`; used in Cards/Structured/JobDrawer.
    - DoD: Users see clear empty guidance and subtle skeletons during work.

- Drawers a11y polish [Done]
    - What’s needed: aria-label/aria-labelledby on dialogs; polite announcements.
    - Where: `components/{DiffDrawer,JobDrawer}.tsx`.
    - DoD: Screen readers announce dialog names and progress updates.

- Inline guidance (InfoCallout) [Done]
    - What’s needed: Short, action-focused tips in Search, Arrange, Style, Excel; notes in Frames; advanced guidance in Structured.
    - Where: Affected tabs under `src/frontend/ui/pages`.
    - DoD: Tips are concise, optional, and do not crowd the UI.

- Field spacing normalization [Done]
    - What’s needed: Align InputField spacing to SelectField; avoid ad‑hoc margins.
    - Where: `ui/components/InputField.tsx`.
    - DoD: Uniform spacing between fields in all tabs.

- Advanced options grouping (Structured) [In progress]
    - What’s needed: Tighter grouping of related numeric/select controls with consistent gaps; brief context note.
    - Where: `ui/pages/StructuredTab.tsx` (Advanced `<details>` block).
    - DoD: Advanced panel reads as cohesive groups; spacing aligns to tokens.

- Keyboard & focus order checks [Planned]
    - What’s needed: Verify Tabs → first section → fields → StickyActions order; add tests where useful.
    - Where: tests under `tests/client/*`.
    - DoD: Keyboard-only users can operate core flows easily; tests pass.

- Typography sweep [Planned]
    - What’s needed: Confirm small/body text sizes for Paragraph and lists; eliminate hard-coded font sizes where possible.
    - Where: `ui/components/Paragraph.tsx`, help lists, tips.
    - DoD: Text sizes align with Aura tokens; no stray px values.

- Re-enable hooks post-UX pass [Planned]
    - What’s needed: Restore Husky hooks (core.hooksPath) and commitlint once UX iteration stabilizes.
    - Where: repo git config / `.husky`.
    - DoD: CI/local hooks enforce lint/format/commit style again.

- No non‑null assertions
    - What’s needed: Enable `@typescript-eslint/no-non-null-assertion` and refactor code to use guards/narrowing.
    - Where: `eslint.config.mjs`, code in `src/**`.
    - DoD: Lint clean with rule enabled; code uses safe checks.

- Backend input validation with Zod
    - What’s needed: Ensure all externally‑sourced inputs (routes, webhooks, env parsing) validate via Zod or JSON Schema.
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

- Ban double assertions in app code
    - What’s needed: Enforce rule preventing `as unknown as` in `src/**`; provide typed helpers/guards and migrate any remaining occurrences. Keep tests override only where necessary.
    - Where: `eslint.config.mjs` rule; code in `src/**`.
    - DoD: `rg` finds zero `as unknown as` in app code; lint blocks regressions.

- ESLint resolver for path aliases
    - What’s needed: Wire `eslint-import-resolver-typescript` to resolve TS `paths`/`baseUrl` and avoid false positives.
    - Where: `eslint.config.mjs`, devDependencies.
    - DoD: Lint resolves `@/*` or `src/*` imports without errors.

- Barrel hygiene and named exports
    - What’s needed: Audit barrels to avoid cycles; enforce `import/no-default-export` with allowlist; prefer named exports.
    - Where: `eslint.config.mjs`; code in `src/**`.
    - DoD: No default exports outside allowlist; no cycles via barrels.

- React accessibility linting
    - What’s needed: Add `eslint-plugin-jsx-a11y` with recommended rules; fix high-signal violations.
    - Where: `package.json` devDependency and `eslint.config.mjs`; code in `src/frontend/**`.
    - DoD: a11y lint passes; obvious accessibility issues addressed.

## Testing & Coverage

- Env var error handling tests
    - What’s needed: Tests for missing required envs throwing descriptive errors; tests for default `PORT` and JSON array parsing.
    - Where: `src/config/env.test.ts`.
    - DoD: Tests pass and cover edge cases for env parsing and defaults.

- Error handler coverage
    - What’s needed: Cover non‑validation error paths; verify custom HTTP codes and response shapes.
    - Where: `src/config/error-handler.test.ts`.
    - DoD: Tests assert correct codes/payloads for various error types.

- Change queue behavior tests
    - What’s needed: Mock timers to test clamping, retry/drop flows, backoff logging; verify queue drains on shutdown.
    - Where: `src/queue/changeQueue.test.ts` and lifecycle‑related tests.
    - DoD: All queue scenarios covered; shutdown drain verified.

- Idempotency repository TTL tests
    - What’s needed: Mock `Date.now` to verify TTL cleanup; confirm duplicate keys extend TTL.
    - Where: `src/repositories/idempotencyRepo.test.ts`.
    - DoD: TTL behavior validated; duplicates extend TTL as expected.

- Client tests stability
    - What’s needed: Fix timeouts in `search-tab` tests for debounced search and clear‑query; fix parsing issues in `style-presets` tests (ensure JSDOM env, correct ESM/JSX handling, proper `.tsx`).
    - Where: `tests/client/search-tab.test.tsx`, `tests/client/style-presets.test.ts[x]`.
    - DoD: `npm test` runs without Vitest parse failures and with flake‑free timeouts.

- Coverage thresholds in Vitest
    - What’s needed: Set `test.coverage.thresholds` for statements/branches/functions/lines ≥ 80; add CI coverage run that fails below thresholds.
    - Where: `vitest.config.ts`, `.github/workflows/ci.yml` (coverage step).
    - DoD: Local and CI runs fail if coverage drops below thresholds; coverage report generated.

- Quality Gates alignment follow‑up
    - What’s needed: Plan to raise thresholds to meet project Quality Gates (target ≥ 90%). Track as a follow‑up in `improvement_plan.md` when ready.
    - Where: `vitest.config.ts` (future change), `improvement_plan.md` (tracking).
    - DoD: Thresholds eventually updated to ≥ 90% with tests supporting the increase.

## Developer Experience

- Production Dockerfile
    - What’s needed: Multi‑stage build (builder → runner) on `node:20-alpine`; build Vite + tsc; run with `node dist/server.js`.
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
    - What’s needed: Describe `createServer`, start/stop, and signal handling in the Node architecture doc.
    - Where: `docs/node-architecture.md`.
    - DoD: Docs include lifecycle & signals section reflecting implemented behavior.

- Document queue persistence strategy
    - What’s needed: Capture persistence design, trade‑offs, and operational notes.
    - Where: `docs/node-architecture.md`.
    - DoD: Clear section explaining persistence choices and recovery.

- Operational runbook
    - What’s needed: Create `docs/runbook.md` covering env vars, health endpoints, graceful shutdown, queue metrics, and secret rotation basics.
    - Where: `docs/runbook.md` (new).
    - DoD: Runbook exists and is referenced by deployment docs.

- Update retry semantics in docs
    - What’s needed: Add jitter/Retry‑After behavior and queue limits/telemetry to docs.
    - Where: `docs/node-architecture.md`.
    - DoD: Documentation reflects current retry and telemetry patterns.
