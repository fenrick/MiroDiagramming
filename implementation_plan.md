# Implementation Plan

Purpose: Track pending improvements and code quality actions. Remove items once addressed.

## Testing & Coverage

- _Good_: Project enforces ESLint, TypeScript strict mode and Vitest per [AGENTS.md](AGENTS.md).
- Add test in `src/config/env.test.ts` for missing required env vars to throw descriptive error.
- Add test in `src/config/env.test.ts` verifying default `PORT` and JSON array env parsing.
- Add test in `src/config/error-handler.test.ts` covering non-validation error paths.
- Add test in `src/config/error-handler.test.ts` verifying custom HTTP codes and response shapes.
- Add test in `src/queue/changeQueue.test.ts` with mocked timers for clamping, retry/drop flows and backoff logging.
- Add test in `src/queue/changeQueue.test.ts` ensuring the queue drains on shutdown.
- Add test in `src/repositories/idempotencyRepo.test.ts` mocking `Date.now` to verify TTL cleanup.
- Add test in `src/repositories/idempotencyRepo.test.ts` confirming duplicate keys extend TTL.
- Set `statements`, `branches`, `lines` and `functions` coverage ≥ 80% in `vitest.config.ts`.
- Fix timeouts in `tests/client/search-tab.test.tsx` so debounced search and clear-query tests pass.
- Resolve parse errors and ensure `tests/client/style-presets.test.ts` runs under Vitest.

## Linting, Formatting & Code Smells

- _Good_: Prettier and ESLint are configured per [AGENTS.md](AGENTS.md).
- Expand `npm run lint` to cover `src/frontend/`, `tests/` and `scripts/` directories.
- Fix ESLint warnings and parsing issues across tests, especially `tests/client/style-presets.test.ts`.
- Run `npm run format:write` to maintain consistent formatting.
- Configure ESLint to fail on warnings to surface code smells early.

## Architecture & Testability

- _Good_: Backend and frontend share a single Node process as documented in [docs/node-architecture.md](docs/node-architecture.md).
- Export a callable `createServer()` from `src/server.ts` for integration tests.
- Guard auto-start in `src/server.ts` with `if (require.main === module)`.
- Store pending `changeQueue` tasks via Prisma/SQLite as described in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Document trade-offs of queue persistence in [docs/node-architecture.md](docs/node-architecture.md).
- Add an integration test that starts the Fastify app and hits a sample route.

## Type Safety & SDK Usage

- _Good_: Strong TypeScript typing and the `withMiroRetry` wrapper around the Miro SDK.
- Replace `Record<string, unknown>` in `src/services/miroService.ts` with SDK types or explicit DTOs.
- Import types from `@mirohq/websdk-types` in frontend code under `src/frontend/`.
- Enable `noImplicitAny` in `tsconfig.json` and `tsconfig.client.json`.
- Define shared DTOs in `src/types/` for data passed between backend and frontend.

## Miro API & Webhook Integration

- _Good_: Retry helper centralizes API error handling.
- Refactor board listing in `src/services/miroService.ts` to use SDK pagination helper (`for await ...`).
- Update [docs/node-architecture.md](docs/node-architecture.md) to mention SDK pagination helper.
- Replace custom `verifyWebhookSignature` in `src/utils/webhookSignature.ts` with official SDK helper when released; update tests accordingly.

## Documentation

- _Good_: Architecture docs provide clear guidance on system design.
- Remove completed items from `improvement_plan.md` following [AGENTS.md](AGENTS.md).
- Document server refactor in [docs/node-architecture.md](docs/node-architecture.md) after implementation.
- Document queue persistence strategy in [docs/node-architecture.md](docs/node-architecture.md) after implementation.
