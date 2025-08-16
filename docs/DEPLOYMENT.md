# Node Client Deployment Guide

The .NET deployment guide has moved to [legacy/dotnet/docs/DEPLOYMENT.md](../legacy/dotnet/docs/DEPLOYMENT.md).

This document covers building and hosting the React client.

## 1. Build

```bash
npm --prefix web/client run build
```

## 2. Deploy

Upload `web/client/dist/` to your static host (e.g., Vercel, Netlify or S3).

## 3. Environment Variables

- `MIRO_APP_ID`
- `PUBLIC_BASE_URL`
- `FEATURE_FLAG_SDK_KEY`
- `SENTRY_DSN`
- `NODE_ENV`
- `LOG_LEVEL`

See your hosting provider's documentation for setting environment variables. CI/CD and monitoring hooks are described in [ARCHITECTURE.md](ARCHITECTURE.md).
