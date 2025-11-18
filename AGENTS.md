# Development Guidelines

Context

- The app runs entirely as a browser-based React (TypeScript) panel built with Vite and Miro’s Web SDK. There is no Fastify/Prisma backend.
- Legacy Python/Node docs are archived in `docs/archive/` for historical reference only.

Authoritative docs

- docs/node-architecture.md – current frontend/Web SDK architecture
- docs/migration-node-plan.md – notes on retiring the server and remaining clean-up
- implementation_plan.md – backlog of improvements and refactors (keep updated)

## Project Structure

```
src/
  app/          # React shell and launch plumbing
  assets/       # Static assets bundled into the panel
  board/        # Board utilities (selection cache, processors, templates)
  components/   # Reusable UI components
  core/         # Shared hooks, services, utilities
  stories/      # Storybook stories (optional)
  ui/           # Panel pages and composite UI modules
  web/          # HTML entrypoints (Vite root)
```

## Quality Gates

- TypeScript strict mode; ESLint clean
- `pnpm run test` currently reports success even without suites; reintroduce Vitest specs as desired.
- Prettier formatting

## Local Development

```
nvm use
pnpm install
pnpm run dev        # vite dev (serves the React panel)
pnpm run typecheck  # tsc --noEmit
pnpm run lint       # eslint
pnpm run test       # vitest
```

Environment

- Optional `.env` for client-side configuration:
    - `VITE_PORT=3000` to override dev server port.
    - `VITE_LOGFIRE_*` flags to tweak logging.
    - Any additional `VITE_*` variables consumed in code.

Notes

- Build output is static. When hosting behind nginx, use `config/default.conf.template`; no API proxying is required.
- All board access and mutations go through the Web SDK helpers under `src/board/**` and `src/core/utils/shape-client.ts`.

## Commits

Follow Conventional Commits:

```
type(scope): short description
```

## Implementation Plan

- Consult `implementation_plan.md` for current improvements and refactor backlog.
- When you complete an item, mark it as [Done] in the plan.
- Prefer small, self-contained PRs; update the plan in the same change to keep it accurate.

## Code Review

- During code review, capture any improvement ideas or refactor opportunities in `implementation_plan.md` so the backlog stays current and actionable.
