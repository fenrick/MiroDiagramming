# Development Guidelines

Context

- The app has completed migration to a single Node.js project using the official Miro Node.js API client. The React (TypeScript) frontend is served by the same Node process in development (via Vite middleware) and in production (as static assets).
- The previous Python FastAPI backend is deprecated and removed. Any remaining Python docs are legacy reference only.

Authoritative Node docs

- docs/node-architecture.md – Node backend architecture and Miro integration
- docs/migration-node-plan.md – migration plan and status
- improvement_plan.md – prioritized quick wins and refactors (keep updated)

## Project Structure

```
src/                    # backend + frontend sources
  app.ts, server.ts     # Fastify app and entrypoint
  config/               # env (zod), logger, db (Prisma)
  routes/               # API routes
  services/, queue/     # domain services and background worker
  frontend/             # React sources
  web/                  # HTML entry points (Vite root)
prisma/                 # Prisma schema and migrations
tests/                  # Node tests (Vitest)
```

## Quality Gates

- TypeScript strict mode; ESLint clean
- Tests and coverage via Vitest + c8 (target ≥ 90%)
- Prettier formatting

## Local Development

```
nvm use
npm install
npm run dev        # single process: Fastify + Vite middleware
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run test       # vitest
```

Environment

- Create `.env` at repo root. Minimum:
    - `DATABASE_URL=file:./app.db`
    - `MIRO_CLIENT_ID=...`, `MIRO_CLIENT_SECRET=...`, `MIRO_REDIRECT_URL=http://localhost:3000/auth/miro/callback`
    - Optional: `PORT=4000`
    - Optional: `MIRO_WEBHOOK_SECRET=change-me` (verify `/api/webhook` signatures)

## Commits

Follow Conventional Commits:

```
type(scope): short description
```

## References

- docs/node-architecture.md (authoritative)
- docs/DEPLOYMENT.md
- docs/archive/python-architecture.md (legacy)

## Improvement Plan

- Consult `improvement_plan.md` for current quick wins and refactor backlog.
- When you complete an item, remove it from the plan (the plan only lists pending work).
- Prefer small, self-contained PRs; update the plan in the same change to keep it accurate.
