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
- Set minimum coverage gates in `vitest.config.ts`
  _Action_: Add `test.coverage.thresholds` (statements/branches/functions/lines ≥ 80).
  _Why_: Enforces quality bar in CI, not just local.

    ```ts
    // vitest.config.ts
    export default defineConfig({
        test: {
            coverage: {
                provider: 'v8',
                thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
                reporter: ['text', 'lcov'],
                reportsDirectory: 'coverage',
            },
        },
    })
    ```

- Run coverage in CI and fail below thresholds
  _Action_: Add `npm run coverage` step (or `vitest run --coverage`) in `.github/workflows/ci.yml` after unit tests.
  _Why_: Makes the gate enforceable in PRs.

- Fix parsing issue in `tests/client/style-presets.test.ts`
  _Action_: Resolve import/JSX parsing error (ensure `/** @vitest-environment jsdom */`, correct ESM imports, and file extension `.tsx` if JSX).
  _Why_: Unblocks full client suite.
  _Done when_: `npm test` runs without Vitest parse failures.

- Add server lifecycle test
  _Action_: New test `tests/integration/server/lifecycle.test.ts` that starts the server (see “Graceful shutdown” below), hits `/healthz`, then triggers shutdown and asserts queue stop was called.
  _Why_: Prevents regressions in start/stop hooks.

## Linting, Formatting & Code Smells

- _Good_: Prettier and ESLint are configured per [AGENTS.md](AGENTS.md).
- Expand `npm run lint` to cover `src/frontend/`, `tests/` and `scripts/` directories and fail on warnings.
  _Action_: Update `package.json` `lint` script:

    ```json
    // package.json scripts
    "lint": "eslint \"src/**/*.ts*\" \"tests/**/*.ts*\" \"scripts/**/*.ts\" --max-warnings 0"
    ```

    _Why_: Keeps client and scripts tidy too.

- Fix ESLint warnings and parsing issues across tests, especially `tests/client/style-presets.test.ts`.
- Run `npm run format:write` to maintain consistent formatting.

## Architecture & Testability

- _Good_: Backend and frontend share a single Node process as documented in [docs/node-architecture.md](docs/node-architecture.md).
- Export a callable `createServer()` from `src/server.ts` for integration tests.
  _Action_: Build the app without listening and reuse in `startServer()`.

    ```ts
    // src/server.ts
    export async function createServer() {
      const app = await buildApp()
      return app
    }
    export async function startServer(port?: number) {
      const app = await createServer()
      ...
    }
    ```

    _Why_: Lets integration tests run against a real Fastify instance without network port binding.

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
- Add jitter to backoff and honour `Retry-After` header in `src/miro/retry.ts`.
  _Action_:

    ```ts
    const ra = Number((err as any)?.headers?.['retry-after'])
    const base = Number.isFinite(ra) ? ra * 1000 : baseDelayMs * 2 ** i
    const jitter = Math.random() * 0.3 + 0.85 // 85–115%
    await delay(base * jitter)
    ```

    _Why_: Reduces thundering herd, aligns to API guidance.

- Use the SDK’s async iterator (`for await (...)`) for listing resources and refactor `src/services/miroService.ts`; document usage in `docs/node-architecture.md`.
- Replace custom `verifyWebhookSignature` in `src/utils/webhookSignature.ts` with official SDK helper when released; update tests accordingly.

## Reliability & Operations

- Graceful shutdown on SIGTERM/SIGINT
  _Action_: In `src/server.ts`, attach signal handlers that `await app.close()` and `changeQueue.stop()`; ensure Fastify `onClose` runs.
  _Why_: Prevents in-flight loss and port binding leaks.

    ```ts
    // src/server.ts
    export async function startServer(port?: number) {
        const env = loadEnv()
        const app = await buildApp()
        changeQueue.start(env.QUEUE_CONCURRENCY)
        const listenPort = port ?? env.PORT
        await app.listen({ port: listenPort, host: '0.0.0.0' })

        const shutdown = async (signal: string) => {
            app.log.info({ signal }, 'shutting down')
            try {
                await app.close()
            } finally {
                changeQueue.stop()
                process.exit(0)
            }
        }
        process.on('SIGTERM', () => void shutdown('SIGTERM'))
        process.on('SIGINT', () => void shutdown('SIGINT'))
        return app
    }
    ```

- Liveness & readiness endpoint
  _Action_: Add `src/routes/health.routes.ts` and register in `src/app.ts`. Route should:
    - `GET /healthz/live`: return `{ status:'ok' }`
    - `GET /healthz/ready`: check Prisma `SELECT 1`, and report `{ db:true, queue_length, in_flight }` with non-200 if DB fails.

    _Why_: Enables container orchestration readiness.

    ```ts
    // src/routes/health.routes.ts
    export const registerHealthRoutes: FastifyPluginAsync = async (app) => {
        app.get('/healthz/live', async () => ({ status: 'ok' }))
        app.get('/healthz/ready', async (_req, reply) => {
            try {
                await getPrisma().$queryRaw`SELECT 1`
                return reply.send({
                    db: true,
                    queue_length: changeQueue.size(),
                    in_flight: changeQueue.inFlight(),
                })
            } catch {
                return reply.code(503).send({ db: false })
            }
        })
    }
    ```

    _Remember_: Keep `registerSpaFallback` excluding `/healthz` as it already does.

- Queue instrumentation & backpressure
  _Action_: In `src/queue/changeQueue.ts`, log structured metrics on task enqueue/dequeue (size, in_flight) at debug level and WARN when queue length breaches a soft limit (e.g., > 500).
  _Why_: Early visibility of overload.
  _Done when_: Logs appear and threshold configurable via env (e.g., `QUEUE_WARN_LENGTH`).

## Security

- Add security headers
  _Action_: Register `@fastify/helmet` in `src/app.ts` (behind `NODE_ENV !== 'test'`) with sensible defaults.
  _Why_: Baseline hardening for production deployments.

- Tighten webhook content-type
  _Action_: In `src/routes/webhook.routes.ts`, enforce `contentType: ['application/json']` and a small `bodyLimit` specifically for the route (Fastify route options), keep `rawBody` enabled.
  _Why_: Reduce attack surface on public webhook.

- Redact more sensitive fields in logs
  _Action_: Extend `redact.paths` in `src/config/logger.ts` to include `req.headers['x-miro-signature']`, `req.headers.cookie`, and any OAuth tokens under `req.headers.authorization`.
  _Why_: Prevents secret leakage in logs.

## Developer Experience

- Add Dockerfile for production
  _Action_: Multi-stage Dockerfile (builder → runner). Use `node:20-alpine`, run `vite build && tsc`, copy `dist/` and `public/`, set `NODE_ENV=production`, `PORT`, run `node dist/server.js`.
  _Why_: Standardise deploy artifact.
  _Done when_: `docker build` and `docker run -p 3000:3000` serve app.

- Make `.env.example` authoritative
  _Action_: Add all required/optional env keys with comments (PORT, SESSION*SECRET, MIRO*_ vars, QUEUE\__).
  _Why_: Faster onboarding and consistent configs.

## Documentation

- _Good_: Architecture docs provide clear guidance on system design.
- Remove completed items from `improvement_plan.md` following [AGENTS.md](AGENTS.md).
- Document server refactor in [docs/node-architecture.md](docs/node-architecture.md) after implementation.
- Document queue persistence strategy in [docs/node-architecture.md](docs/node-architecture.md) after implementation.
- Document operational runbook in `docs/runbook.md` explaining environment variables, `healthz` endpoints, graceful shutdown, queue metrics, and how to rotate secrets.
- Update `docs/node-architecture.md` with sections for lifecycle & signals, health endpoints, queue limits/telemetry, and retry semantics with jitter/Retry-After.
