# Operations Runbook

Concise operational notes for running and supporting the app in production.

## Endpoints

- Liveness: `GET /healthz` → returns `{ status: 'ok' }` when the process is up.
- Readiness: `GET /readyz` → 200 when DB connectivity succeeds and the background change queue is idle; returns 503 with `{ status: 'error', reason: 'db' | 'queue' }` otherwise.

SPA fallback excludes `/api/*` and `/healthz*` to avoid serving `index.html` for probes or API paths.

## Environment Variables

- `PORT` – HTTP port (default `3000`).
- `DATABASE_URL` – Prisma connection string (SQLite by default, e.g. `file:./app.db`).
- `SESSION_SECRET` – cookie signing secret (use a long random value in production).
- `CORS_ORIGINS` – list of allowed origins as JSON array or comma‑separated string.
- `MIRO_CLIENT_ID`, `MIRO_CLIENT_SECRET`, `MIRO_REDIRECT_URL` – OAuth credentials and callback URL.
- `MIRO_WEBHOOK_SECRET` – HMAC secret to verify `/api/webhook` signatures.
- `MIRO_IDEMPOTENCY_CLEANUP_SECONDS` – TTL cleanup interval for idempotency keys (default one day).
- `QUEUE_CONCURRENCY`, `QUEUE_MAX_RETRIES`, `QUEUE_BASE_DELAY_MS`, `QUEUE_MAX_DELAY_MS`, `QUEUE_WARN_LENGTH` – change queue tuning and backpressure threshold.
- `QUEUE_SHUTDOWN_TIMEOUT_MS` – milliseconds to wait for the change queue to drain before shutdown continues (default 5000).

## Start/Stop

- Start: `npm run start` → runs Fastify and the background change queue workers.
- Stop: send SIGTERM/SIGINT. We rely on [`close-with-grace`](https://github.com/mcollina/close-with-grace) which invokes `app.close()` and only exits once Fastify hooks have disconnected Prisma, stopped the queue, and cleared the idempotency cleanup timer.
- During queue shutdown, new tasks are rejected and workers finish in-flight items before resolving. If draining exceeds `QUEUE_SHUTDOWN_TIMEOUT_MS`, the server logs the timeout and proceeds so containers do not hang.
- During drain, `/readyz` will report `503` if the queue has in‑flight work.
- If shutdown exceeds ~10s or another termination signal arrives, the helper logs the failure and exits with code `1` to avoid hanging containers.

## Logs and Redaction

- Structured logs via Pino; pretty printing in development.
- Sensitive fields redacted: `authorization`, `cookie`, `x-miro-signature` headers.
- Background queue emits structured `task.*` events and `queue.backpressure` WARN logs when backlog exceeds the configured threshold; `queue.backpressure.recovered` indicates the queue drained below the limit.

## Webhooks

- Endpoint: `POST /api/webhook`.
- Requirements: `Content-Type: application/json`, body ≤ 1 KiB, `X-Miro-Signature` HMAC header.
- Invalid signatures receive `401` with `{ error: { code: 'INVALID_SIGNATURE' } }`.

## Common Checks

- Auth flow: verify `/auth/miro/login` redirects to Miro and `/auth/miro/callback` completes with tokens stored.
- Queue pressure: monitor logs for `task.retry` and `task.dropped`; watch `/api/limits` for `queue_length` and `in_flight`.
- Database connectivity: `/readyz` returns `{ status: 'error', reason: 'db' }` when DB is unavailable.

## Backups and Migrations

- SQLite file: back up `app.db` before schema migrations.
- Apply migrations: `npm run migrate:deploy`.
