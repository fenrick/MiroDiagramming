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
- `QUEUE_CONCURRENCY`, `QUEUE_MAX_RETRIES`, `QUEUE_BASE_DELAY_MS`, `QUEUE_MAX_DELAY_MS` – change queue tuning.

## Start/Stop

- Start: `npm run start` → runs Fastify and the background change queue workers.
- Stop: send a graceful signal (SIGTERM) and allow the process to close. The server disconnects Prisma and stops the queue on Fastify `onClose`.
- During drain, `/readyz` will report `503` if the queue has in‑flight work.

## Logs and Redaction

- Structured logs via Pino; pretty printing in development.
- Sensitive fields redacted: `authorization`, `cookie`, `x-miro-signature` headers.
- Background queue emits info/warn/error events for processed, retry, and dropped tasks.

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
