# Quick Tools

[![CI](https://github.com/fenrick/MiroDiagramming/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fenrick/MiroDiagramming/actions/workflows/ci.yml?query=branch%3Amain)

Quick Tools is a Vite-built React panel that runs entirely inside Miro. It imports JSON diagrams or cards, lays them out with ELK/Dagre helpers, and writes widgets through the Web SDK—no backend required.

## Requirements

- Node.js ≥ 20
- pnpm ≥ 10 (lockfile is committed)
- Miro developer team with `boards:read` and `boards:write` scopes

## Environment

- Copy `.env.example` to `.env` if you need overrides; only `VITE_*` keys are exposed to the client.
- Common flags: `VITE_PORT` (dev server port) and `VITE_LOGFIRE_*` (console logging tweaks).

## Development

- Install deps: `pnpm install`
- Start dev server: `pnpm run dev`
- Build + preview: `pnpm run build && pnpm run preview`
- Update the Miro app manifest to point at the dev server URL (see `docs/FRONTEND.md`).

## Quality Gates

- Typecheck: `pnpm run typecheck`
- Lint: `pnpm run lint`
- Tests + coverage: `pnpm run test` (Vitest, coverage on by default)
- Format: `pnpm run format`

## Scripts

- `pnpm run dev` – Vite dev server
- `pnpm run build` – Production bundle to `dist/`
- `pnpm run preview` – Static preview of the build
- `pnpm run test` – Vitest in node/jsdom as configured per file
- `pnpm run coverage` – HTML + lcov reports under `coverage/`
- `pnpm run typecheck` – `tsc --noEmit`
- `pnpm run lint` – ESLint (strict, no warnings)

## Documentation

- Start with [`docs/README.md`](docs/README.md) for the index of architecture, UX, deployment, and testing guides.
- Keep [`implementation_plan.md`](implementation_plan.md) current whenever you finish backlog items.

## Project Layout

- `src/app` – React shell and panel plumbing
- `src/board` – Web SDK helpers (selection cache, templates, processors)
- `src/core` – Shared hooks, layout engines, utilities
- `src/ui` – Tabs, composite components, hooks
- `templates/` – Shape/card/connector templates consumed at runtime
- `docs/` – Living documentation (see index)

## Conventions

- Conventional Commits (`type(scope): message`) enforced via commitlint
- ESLint + Prettier run in CI and via Husky pre-commit hook
- Tabs/pages should use design-system components (`@mirohq/design-system`) and tokens, not custom CSS
- Names for docs and scripts stay uppercase with underscores (e.g., `CODE_STYLE.md`) for consistency across GitHub

## Deployment

- Bundle with `pnpm run build`, upload `dist/` to your static host, and update the Miro manifest `sdkUri`
- `docs/operations/OPERATIONS.md` captures hosting, monitoring, and rollback steps

## Support

- Issues/ideas: open a GitHub issue
- Security: follow `SECURITY.md`

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and
the development workflow.

## 🪪 License <a name="license"></a>

This software is released into the public domain under [The Unlicense](LICENSE).
See the LICENSE file for details.

<!-- Removed: Database (Prisma) section; no backend/database in the frontend-only app. -->
