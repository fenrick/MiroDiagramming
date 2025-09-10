# Node.js Backend Architecture (Miro Integration)

This document defines the new end-to-end system design after removing the Python layer and moving the backend to Node.js. It also embeds the key usage patterns for the official Miro Node.js API client.

## Goals

- Single-language stack: Node.js backend + React (TypeScript) frontend
- First-class Miro OAuth 2.0 and API integration using `@mirohq/miro-api`
- Strong typing, testing, and linting parity with previous quality gates
- Maintain existing product behavior and API semantics where practical

## Tech Stack

- Runtime: Node.js 20+, TypeScript (strict)
- Web framework: Fastify (high perf, good ecosystem) or Express (if preferred)
- Miro SDK: `@mirohq/miro-api` (high-level stateful `Miro` and low-level stateless `MiroApi`)
- Data: SQLite (initial) via Prisma ORM (or Drizzle) with migration support
- Testing: Vitest or Jest + Supertest; c8 for coverage
- Lint/Format: ESLint (typescript-eslint), Prettier
- Git hooks: Husky + lint-staged

## Repository Layout (Proposed)

```
src/
  app.ts                   # Fastify app bootstrap
  server.ts                # CLI entry (listen)
  config/
    env.ts                 # env var parsing (zod)
    logger.ts              # pino logger config
    db.ts                  # Prisma client bootstrap
  miro/
    miroClient.ts          # wraps `Miro` high-level client
    tokenStorage.ts        # implements Miro Storage interface using DB
  routes/
    auth.routes.ts         # /auth endpoints (login, callback) + /oauth/* aliases
    cards.routes.ts        # /api/cards (queue + worker pipeline)
    tags.routes.ts         # /api/boards/:boardId/tags
    cache.routes.ts        # /api/cache/:boardId
    limits.routes.ts       # /api/limits
  services/
    miroService.ts         # direct Miro REST interactions
  queue/
    changeQueue.ts         # in-memory queue + worker started at boot
    types.ts               # task types
src/web/                     # React frontend (dev via Vite, built by root scripts)
prisma/
  schema.prisma            # Board, Tag, Shape, User, CacheEntry, IdempotencyEntry
tests/
  integration/             # server integration tests (Vitest + Supertest)
package.json
tsconfig.json
vitest.config.ts
```

## Environment Configuration

Required for Miro OAuth:

- `MIRO_CLIENT_ID`
- `MIRO_CLIENT_SECRET`
- `MIRO_REDIRECT_URL` (e.g., `http://localhost:3000/auth/miro/callback`)

Additional backend env:

- `PORT=4000`
- `SESSION_SECRET` (for cookie signatures)
- `MIRO_WEBHOOK_SECRET` (signature validation for `/api/webhook`)
- `DATABASE_URL` (e.g., `file:./dev.db`)
- `CORS_ORIGIN` (frontend origin during dev)

Use a schema validator (zod) to fail fast if vars are missing.

## Database Access (Prisma)

Import the generated Prisma Client where you need DB access:

```
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

This project exposes a shared singleton via `getPrisma()` (`src/config/db.ts`), which avoids creating multiple client instances.

Development:

```
npm run migrate:dev
```

Deployment:

```
npm run migrate:deploy
```

For low-latency change notifications without polling, consider Prisma Pulse: https://pris.ly/tip-0-pulse

## Miro Node.js API Client Integration

Install:

```
npm install @mirohq/miro-api
```

High-level client (stateful):

```ts
import { Miro } from '@mirohq/miro-api'

// Provide token storage and env configuration
export const miro = new Miro({
    clientId: process.env.MIRO_CLIENT_ID!,
    clientSecret: process.env.MIRO_CLIENT_SECRET!,
    redirectUrl: process.env.MIRO_REDIRECT_URL!,
    storage: new TokenStorage(), // see Storage below
})

// Per-user API accessor
// miro.as(userId) → MiroApi for the given user
```

Low-level client (stateless):

```ts
import { MiroApi } from '@mirohq/miro-api'
const api = new MiroApi('<access_token>')
```

Pagination helpers (example):

```ts
const api = miro.as(userId)
for await (const board of api.getAllBoards()) {
    // handle boards
    break // optional to stop pagination
}
```

Storage interface (token persistence):

```ts
// Implements the Storage interface required by Miro
export class TokenStorage {
    async get(userId: string) {
        return await userTokenRepo.get(userId) // returns State | undefined
    }

    async set(userId: string, state: any) {
        await userTokenRepo.set(userId, state)
    }
}
```

OAuth flow (Fastify example):

```ts
app.get('/auth/miro/callback', async (req, reply) => {
    await miro.exchangeCodeForAccessToken(req.cookies.userId, (req.query as any).code)
    reply.redirect('/')
})

app.get('/', async (req, reply) => {
    if (!(await miro.isAuthorized(req.cookies.userId))) {
        reply.redirect(miro.getAuthUrl())
        return
    }
    const api = miro.as(req.cookies.userId)
    for await (const board of api.getAllBoards()) {
        return reply.send(board)
    }
})
```

Notes:

- `miro.isAuthorized(userId)`, `miro.getAuthUrl()`, `miro.exchangeCodeForAccessToken(userId, code)`, and `miro.as(userId)` are the core methods to manage OAuth and access-token based calls.
- Implement storage with a real database for production. The client auto-refreshes tokens.

## API Design (Parity with Current Python Endpoints)

Keep route semantics where possible, updating implementation:

- `GET /api/cache/:boardId` → use CacheService + BoardRepo
- `GET /api/boards/:id/tags` → TagService using DB + Miro if required
- `POST /api/cards` and other existing routers → mirror functionality
- `POST /api/webhook` → verify signature and enqueue work as needed

Cards pipeline:

- `POST /api/cards` accepts an array of card definitions. It enqueues tasks into an in-memory queue and returns 202 with `{ accepted }`.
- A background worker processes tasks and creates cards via Miro REST. Include `boardId` in card definitions to route creation to a board.

New auth routes:

- `GET /auth/miro/login` → redirect to `miro.getAuthUrl()`
- `GET /auth/miro/callback` → `exchangeCodeForAccessToken`
- `GET /api/auth/status` → report app-level auth state

Use DTOs and zod schemas for request/response validation.

## Data Model Mapping (Python → Node)

Planned Prisma models (aligned to existing SQLite data):

- `Board(id, boardId, name, createdAt, updatedAt)`
- `Tag(id, name, color, boardId)`
- `Shape(id, boardId, shapeId, data, createdAt)`
- `UserToken(userId, provider, accessToken, refreshToken, expiresAt, scopes, rawState)`
- `CacheEntry(key, value, createdAt, updatedAt)` (optional if keeping cache)

We will map SQLAlchemy tables one-to-one and add migrations to preserve data.

## Services & Responsibilities

- BoardService: resolve board info (DB cache + Miro), orchestrate CRUD via `miro.as(user).getBoard(...)`, `createBoard`, item operations
- TagService: list/attach/detach tags; keep local Tag table consistent where needed
- CacheService: optional layer for board state snapshots (parity with Python `repository.py`)

## Error Handling & Logging

- Central error middleware: map domain errors to HTTP
- Use Pino logger with request-id; structured logs
- Mask secrets; never log tokens

## Security

- HTTPS in production; secure HTTP-only cookies (`sameSite=strict`)
- CORS via `@fastify/cors` and `CORS_ORIGIN` env
- CSRF protection for state-changing endpoints (if applicable)
- Input validation (zod) and output typing
- Secrets from env; no tokens in source control

## Testing & Coverage

- Unit tests for services (mock `MiroApi`)
- Integration tests for routes (Supertest + in-memory DB or test DB)
- Coverage target ≥ 90% lines & branches

## Local Development

- Single root `package.json`; no nested packages
- `npm install` at repo root
- `npm run dev` runs one Node process: Fastify + Vite middleware
- In production, server serves `src/client/dist` (static) and API
- Ensure `MIRO_*` env vars are set; redirect URL points to local server

## Deployment

- Build with `npm run build` (client + server)
- Run with `npm run start` (serves built UI and API)
- Configure env (MIRO_CLIENT_ID/SECRET/REDIRECT_URL, DATABASE_URL, PORT)
- Health check endpoint: `/healthz`

## Backwards Compatibility

- Maintain existing REST endpoints when feasible
- Keep `app.db` data; migrate schema via Prisma
- Provide a cutover checklist (see migration plan)

## Open Questions

- Keep cache endpoints or replace with live queries?
- Choose ORM (Prisma vs Drizzle) – Prisma assumed herein
- Job queue strategy (BullMQ with Redis if heavier workloads emerge)
