# Operations

## Build & Preview

- `pnpm run build` outputs static assets to `dist/`.
- `pnpm run preview` serves the bundle locally; use it to spot-check before deploying.

## Deployment

- Host `dist/` on any static platform (S3+CloudFront, Netlify, Vercel, nginx).
- Update the Miro app manifest `sdkUri` to the deployed `index.html`.

## Monitoring

- Health-check the hosted `index.html` (HTTP 200 + HTML signature) and rely on host/CDN metrics.
- Client-side logging uses `src/logger.ts`; inspect browser console for incidents.

## Release & Rollback

- Keep the last known good `dist/` artifact; redeploy it to roll back.
- Semantic release handles changelog entries in `CHANGELOG.md`.

## Testing & Quality Gates

- `pnpm run test` executes Vitest suites (node + jsdom) with coverage enabled.
- `pnpm run typecheck`, `pnpm run lint`, and `pnpm run format` gate PRs locally and in CI.
