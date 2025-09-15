# Node Client Deployment Guide

This document covers building and hosting the React client.

## 1. Build

```bash
npm run build
```

## 2. Deploy

Upload `dist/` to your static host (e.g., Vercel, Netlify or S3).

## 3. Environment Variables

- `MIRO_APP_ID`
- `PUBLIC_BASE_URL`
- `FEATURE_FLAG_SDK_KEY`
- `SENTRY_DSN`
- `NODE_ENV`
- `LOG_LEVEL`

See your hosting provider's documentation for setting environment variables. CI/CD and monitoring hooks are described in [ARCHITECTURE.md](ARCHITECTURE.md).

## 4. Backend Secrets

The Node backend loads required secrets from environment variables as parsed by `src/config/env.ts`.

### Local development

On first run the backend will create `config/.env` and `config/config.yaml` from their example files and exit.
Populate `config/.env` with values for:

- `MIRO_CLIENT_ID`
- `MIRO_CLIENT_SECRET`
- `MIRO_WEBHOOK_SECRET`

### Continuous integration

Provision the same variables through your CI secret store (e.g. GitHub Actions secrets) and expose them as environment variables at build and deploy time. Never commit real secret values to the repository.

### CORS origins

Set allowed origins through the `CORS_ORIGINS` environment variable as a JSON array:

```bash
CORS_ORIGINS='["https://app.example.com","https://admin.example.com"]'
```

Alternatively, provide a comma-separated list:

```bash
CORS_ORIGINS='https://app.example.com,https://admin.example.com'
```

List each origin explicitly. Wildcards can match subdomains, but avoid using `"*"` in production to restrict cross-origin access.

### Health and Readiness Probes

Configure your load balancer/orchestrator to use the following endpoints:

- Liveness: `GET /healthz` (returns `{ status: 'ok' }` when the process is alive).
- Readiness: `GET /readyz` (returns 200 only when the DB is reachable and the background change queue is idle; otherwise 503).

The production server also serves the SPA. Its fallback is configured to exclude `/api/*` and `/healthz*` so probes and API routes do not resolve to the client `index.html`.
