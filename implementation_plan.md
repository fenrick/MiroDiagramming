# Implementation Plan

Purpose: Track pending improvements and code quality actions. Do not remove items; mark them done as completed. Each item lists what’s needed, where it applies, and the definition of done (DoD).

Guiding principle: configure and compose established frameworks (e.g., Fastify) instead of building a custom framework.

## Server Architecture & Lifecycle

- Expose `buildApp()` for tests [Done]
    - What’s needed: Allow tests to construct the Fastify app without binding a port; avoid custom server wrappers.
    - Where: `src/app.ts` exports `buildApp()`; `src/server.ts` starts the server directly.
    - DoD: Integration tests import `buildApp()` and run requests via `app.inject` without network listeners.

- Guard auto-start in entrypoint [Done]
    - What’s needed: Only auto-start server when the file is executed directly.
    - Where: `src/server.ts` using `if (require.main === module) { startServer() }`.
    - DoD: Running tests that import the module does not start a listener.

- Graceful shutdown on SIGTERM/SIGINT
    - What’s needed: Signal handlers that `await app.close()` and stop background workers; make sure Fastify onClose hooks run.
    - Where: `src/server.ts` (signal handlers), `src/queue/changeQueue.ts` (stop hook if needed).
    - DoD: Sending SIGINT/SIGTERM closes the server cleanly and calls `changeQueue.stop()`; verified by lifecycle test.

- Health and readiness endpoints [Done]
    - What’s needed: Provide liveness and readiness probes suitable for containers.
    - Where: Implemented in `src/app.ts` as `GET /healthz` (liveness) and `GET /readyz` (readiness); SPA fallback excludes `/healthz*`.
    - DoD: `/healthz` returns `{ status: 'ok' }`; `/readyz` returns 200 only when DB connectivity succeeds and the change queue is idle, 503 on DB/queue issues.

- Server lifecycle integration test
    - What’s needed: Start server/app, hit `/healthz`, then trigger shutdown and assert queue stop called.
    - Where: `tests/integration/server/lifecycle.test.ts`.
    - DoD: Test passes reliably and guards start/stop regressions.

## Security

- Security headers via Helmet [Done]
    - What’s needed: Register `@fastify/helmet` with sensible defaults; disable in tests.
    - Where: `src/app.ts` (conditional on `NODE_ENV !== 'test'`).
    - DoD: Responses include standard security headers in non-test envs; no breakage observed.

- Tighten webhook content-type and size [Done]
    - What’s needed: Enforce `application/json`, set small `bodyLimit`, keep `rawBody` enabled for signature check.
    - Where: `src/routes/webhook.routes.ts` (route options/schema).
    - DoD: Route rejects invalid content types/oversized bodies; existing webhook tests pass.

- Redact sensitive fields in logs [Done]
    - What’s needed: Extend logger redaction to headers and tokens.
    - Where: `src/config/logger.ts` (`redact.paths` to include `req.headers['x-miro-signature']`, `req.headers.cookie`, `req.headers.authorization`).
    - DoD: Logs show `[Redacted]` for configured fields; no secrets leak in app logs.

- Domain error classes and mapping
    - What’s needed: Define lightweight domain error classes with machine-readable `code` and centralize mapping to HTTP statuses (400/401/403/409/429) in the error handler.
    - Where: `src/config/error-response.ts`, `src/config/error-handler.ts`, thrown from services/routes.
    - DoD: Errors include codes; centralized handler maps to correct status/payload; tests assert mappings.

## Reliability & Operations

- Liveness and readiness endpoints exposed for orchestration [Done]
    - What’s needed: Provide `/healthz` and `/readyz` for Kubernetes/Docker health checks; readiness verifies DB and queue idle; SPA fallback excludes `/healthz/*`.
    - Where: Implemented in `src/app.ts`.
    - DoD: `/healthz` 200 OK, `/readyz` 200 only when ready, 503 otherwise.

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
    - What’s needed: Plan to raise thresholds to meet project Quality Gates (target ≥ 90%). Track as a follow‑up in `implementation_plan.md` when ready.
    - Where: `vitest.config.ts` (future change), `implementation_plan.md` (tracking).
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

- Keep plan current
    - What’s needed: Mark completed items as [Done] and ensure `implementation_plan.md` reflects pending work.
    - Where: `implementation_plan.md`.
    - DoD: Only pending work remains listed; updated alongside related PRs.

- Document server lifecycle [Done]
    - What’s needed: Describe server start/stop and graceful close behavior.
    - Where: `docs/node-architecture.md` (Server Lifecycle section).
    - DoD: Docs include lifecycle notes; aligns with `buildApp()`/`startServer()`.

- Document queue persistence strategy
    - What’s needed: Capture persistence design, trade‑offs, and operational notes.
    - Where: `docs/node-architecture.md`.
    - DoD: Clear section explaining persistence choices and recovery.

- Operational runbook [Done]
    - What’s needed: `docs/runbook.md` covering env vars, health/readiness, shutdown notes, queue metrics.
    - Where: `docs/runbook.md`.
    - DoD: Runbook exists and is referenced by deployment docs.

- Update retry semantics in docs
    - What’s needed: Add jitter/Retry‑After behavior and queue limits/telemetry to docs.
    - Where: `docs/node-architecture.md`.
    - DoD: Documentation reflects current retry and telemetry patterns.

## Improvement Backlog

## UX Alignment (Aura)

- Normalize form controls to design-system `Form` components and field groups. [Planned]
- Add loading states to long operations (board scan, imports, diff). [Planned]
- Audit keyboard navigation and focus order across Tabs, modals, and lists; add a11y tests. [Planned]

## Jobs & Backend Infrastructure

- Progressive job status API for UI progress bars [Planned]
    - What’s needed: Add incremental job progress endpoints/events (percent, ETA, current step) to support granular progress UI and cancel.
    - Where: `src/services/*` long‑running ops; `src/routes/*` job endpoints; extend `changeQueue` to publish progress; optional SSE at `/api/jobs/:id/events`.
    - DoD: UI receives progress updates at least every 300ms; cancel endpoint `DELETE /api/jobs/:id` cleanly stops work; tests cover SSE and cancellation.

- Optimistic operation journaling [Planned]
    - What’s needed: Persist optimistic ops journal to allow undo/rollback when Miro API rejects batch items.
    - Where: `src/frontend/core/hooks/useOptimisticOps.ts`; backend reconciliation in `src/services/miroService.ts`.
    - DoD: Failed ops visibly roll back in UI with a toast and diff; journal flushed on success; tests cover happy/failed flows.

- Telemetry pipeline (privacy‑first) [Planned]
    - What’s needed: Add optional anonymized event telemetry (feature usage, latencies, errors) with user consent toggle.
    - Where: Event sink in `src/config/logger.ts` or lightweight analytics module; opt‑in setting persisted per board.
    - DoD: Events buffer locally and batch‑send; PII scrubbed; toggle surfaced in Settings; docs updated.

## UX & Navigation

- First‑run onboarding tour [Planned]
    - What’s needed: Contextual coach marks for the three core actions (Import, Layout, Sync) and a “Try with sample data” path.
    - Where: `src/frontend/pages/HelpTab.tsx`, new `src/frontend/ui/components/CoachMarks.tsx`, integrate with `App.tsx` first‑run check (board metadata / localStorage).
    - DoD: First open shows 3–5 step tour, skippable and never auto‑repeats; sample board creates non‑destructive widgets for demo.

- Command palette and shortcuts [Planned]
    - What’s needed: Add `Cmd/Ctrl+K` palette to run actions (search, layout, style presets, selection ops). Document shortcuts.
    - Where: `src/frontend/ui/components/CommandPalette.tsx` (new); wire into existing actions in `pages/` and hooks.
    - DoD: Palette opens with `Cmd/Ctrl+K`; arrow/Enter navigates; actions execute; help lists available shortcuts.

- Consistent panel IA and tabs [Planned]
    - What’s needed: Audit tab taxonomy; prioritize common tasks; reduce to 5–7 top‑level tabs; move advanced items to nested tabs with clear labels.
    - Where: `src/frontend/ui/pages/tabs.ts`, `tab-definitions.ts`, each Tab component.
    - DoD: Tabs ordered by frequency; labels concise; tree fits Miro panel height without scrolling on 768px.

- Settings panel (per board) [Planned]
    - What’s needed: Consolidate toggles for telemetry opt‑in, default layout options, import behaviors; persist in board metadata.
    - Where: New `SettingsTab.tsx`; persistence via existing metadata utilities.
    - DoD: Settings persist per board; toggle changes reflected immediately.

- Context menu integration [Planned]
    - What’s needed: Provide right‑click context menu entries for common actions when supported by Miro SDK.
    - Where: Miro SDK integration points and UI action handlers.
    - DoD: Users can trigger key actions from selection context without opening the panel.

## Feedback & Error Handling

- Loading and skeleton states [Planned]
    - What’s needed: Add skeletons/placeholders for remaining imports and diff views; avoid spinner‑only states.
    - Where: pages invoking async work.
    - DoD: Each async view renders skeleton within 100ms; shimmer duration ≤ 400ms motion token.

- Job Drawer UX overhaul [Planned]
    - What’s needed: Unify progress bars, step list, errors, and retry in `JobDrawer`; add “Copy error details” and “Report issue”.
    - Where: `src/frontend/components/JobDrawer.tsx`, `DiffDrawer.tsx` integration.
    - DoD: Users see granular progress and can retry/cancel; detailed error view available and copyable.

- Error handling microcopy and remediation [Planned]
    - What’s needed: Human‑friendly error titles, causes, and next steps (e.g., “Reconnect Miro”); consistent toasts vs inline errors.
    - Where: Shared error mapper in `src/frontend/core/*` and components.
    - DoD: Errors are actionable; retry paths visible; no raw exception text leaks.

- Empty states with guidance [Planned]
    - What’s needed: Purposeful empty views with illustration, one primary CTA, and link to Help.
    - Where: Each tab initial state.
    - DoD: Empty screens helpful and consistent; tracked via telemetry.

- Offline/network state & retry UX [Planned]
    - What’s needed: Show network banner, queue actions offline, auto‑retry with backoff; clear resume messaging.
    - Where: Global app shell and network hook; integrates with queue.
    - DoD: Temporary disconnects don’t lose actions; banner disappears on recovery.

## Selection & Editing

- Selection‑aware quick actions [Planned]
    - What’s needed: Show context ribbon when selection changes (group, align, style preset, tag apply, layout selection).
    - Where: `src/frontend/components/SyncStatusBar.tsx` or new `QuickActions.tsx`; hook into `useSelection`.
    - DoD: Selecting items reveals context actions; keyboard access works; actions disabled when invalid.

- Search & filter UX upgrade [Planned]
    - What’s needed: Fuzzy search with highlight and keyboard navigation; filter by type/tag; enable “jump to on board”.
    - Where: `src/frontend/ui/pages/SearchTab.tsx`, `node-search.ts`, `search-tools.ts`.
    - DoD: Query highlights matches; Up/Down selects result; Enter zooms on board; filters persist per board.

- Style presets: preview and apply [Planned]
    - What’s needed: Add visual previews for presets with hover/keyboard preview‑on‑selection; allow “apply to selection”.
    - Where: `src/frontend/ui/style-presets.ts`, `StyleTab.tsx`.
    - DoD: Hover previews selection without commit; click applies; keyboard left/right cycles; undo supported.

- Layout tooling improvements [Planned]
    - What’s needed: Live layout preview with ghost frames; “apply to selection”; layout constraints in UI.
    - Where: `src/frontend/core/graph/layout-*`, `LayoutEngineTab.tsx`.
    - DoD: Preview toggles on/off; apply respects constraints; visible guidance for invalid selections.

## Performance & Scalability

- Performance: virtualization & progressive rendering [Planned]
    - What’s needed: Virtualize long lists (results, diff); debounced interactions; chunked board scanning; show progress.
    - Where: Search/Results lists, DiffDrawer, board scanning services.
    - DoD: 60fps interactions on 5k+ items; time‑to‑interactive < 200ms for panel.

## Accessibility & Internationalization

- Keyboard navigation & focus management [Planned]
    - What’s needed: Ensure all interactive controls reachable via keyboard; visible focus; modal focus trap; `Esc` to close.
    - Where: Modal, TabBar, Search results, JobDrawer.
    - DoD: Keyboard‑only flow completes core tasks; tests include a11y checks.

- Internationalization scaffold [Planned]
    - What’s needed: Wrap copy in i18n; extract messages; enable locale switch for future translations.
    - Where: Lightweight i18n utility, message catalogs, replace literals.
    - DoD: English catalog complete; infrastructure supports adding locales without code changes.

---

---

Execution guidance:

- Prefer small, reviewable PRs grouped by section above.
- Add/update tests alongside behavior changes.
- Keep changes minimal and avoid incidental refactors.
