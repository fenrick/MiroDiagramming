# Runbook

Quick Tools is a static React application. Operational tasks focus on building and serving the bundle.

## Build

```
pnpm install
pnpm run build
```

Artifacts land in `dist/`.

## Local Smoke Test

```
pnpm run preview
```

Visit the printed URL (defaults to `http://localhost:4173`). Launch the app inside a Miro board to verify Web SDK calls succeed.

## Deployment

- Upload `dist/` to your static host (nginx, Vercel, Netlify, S3, etc.).
- Update the Miro app manifest to point to the hosted `index.html`.

## Monitoring

- Track CDN/host availability (HTTP 200 for `index.html`).
- Use browser telemetry or analytics if additional insight is required (no server-side logs exist).

## Incident Response

1. Confirm the static host is serving the latest `dist/` contents.
2. Validate the Miro app redirect URL matches the deployed site.
3. Rebuild locally (`pnpm run build`) if corruption is suspected and redeploy.
4. For SDK errors, reproduce inside Miro with devtools open; verify required app scopes.

## Rollback

Re-deploy the previous `dist/` bundle. Keep the last known good build artifact in your release pipeline or storage bucket for quick rollback.
