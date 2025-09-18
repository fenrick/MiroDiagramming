# Deployment Guide

This project now ships as a static React application that runs inside Miro and talks to the board via the Web SDK. Deployment consists of building the Vite bundle and hosting the generated assets.

## 1. Build

```bash
npm install
npm run build
```

The output lives under `dist/`.

## 2. Host

Upload the contents of `dist/` to your static host (Vercel, Netlify, S3 + CloudFront, nginx, etc). No Node.js runtime is required at runtime.

If you use the provided nginx template (`config/default.conf.template`), mount the built assets at `/usr/share/nginx/html` and serve them directly.

## 3. Environment Variables

All runtime configuration must use the `VITE_` prefix so Vite embeds it into the bundle. Typical variables:

- `VITE_PORT` – overrides the dev server port (development only).
- `VITE_LOGFIRE_SERVICE_NAME` – label used by the console logger.
- `VITE_LOGFIRE_SEND_TO_LOGFIRE` – set to `true` to disable console logging when you forward logs elsewhere.

Set these at build time through your CI/CD provider. Avoid committing secrets; the app runs fully client-side.

## 4. Monitoring & Health Checks

Because there is no application server, standard static-host probes are sufficient. If you front the app with a load balancer, configure it to check the static file endpoint (e.g., `/index.html`).

## 5. Miro App Configuration

Update the Miro app manifest to point to the deployed URL of your `index.html`. The Web SDK permissions determine what board operations your app can perform.
