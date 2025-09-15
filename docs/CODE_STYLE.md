# Coding Standards (TypeScript + React + Fastify)

Scope: These standards apply to all TypeScript/JavaScript code in this repository (backend, frontend, tests, tools, scripts, CI).
Non-goals: These rules are pragmatic. Prefer maintainability, safety, and clarity over cleverness.

---

## Core Principles

- Single purpose
    - Modules, classes, and functions do one thing well; split when names need “and”.
    - Names are descriptive and unabbreviated; avoid magic numbers/strings.

- Readability over cleverness
    - Prefer clear code to terse one‑liners. Extract helpers or add a short comment when intent is not obvious.

- Explicit boundaries
    - Validate inputs at API/route/service boundaries using schemas (Zod or JSON Schema). Trust internal data after validation.

- Dependency injection, not globals
    - Avoid global mutable state and singletons. Pass dependencies explicitly (logger, clock, clients). Encapsulate shared state behind interfaces.

- Fail fast and loud
    - Throw precise errors early with actionable messages. Don’t catch-and-ignore. Preserve cause with `cause` or `from`.

---

## Language & Type System

- TypeScript version and module system
    - Use TypeScript ≥ 5.5 and native ES Modules (`"type": "module"`).

- Strictness
    - Enable strict mode and these flags: `noImplicitAny`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `useUnknownInCatchVariables`, `noPropertyAccessFromIndexSignature`.

- Prefer `unknown` over `any`
    - Narrow via type guards, `zod` parsing, or discriminated unions.

- Immutability and const correctness
    - Use `const` by default. Mark fields/parameters as `readonly` where applicable. Avoid mutation of inputs.

- Types vs interfaces
    - Use `type` for unions/intersections and function signatures; use `interface` for object shapes that are extended/implemented.

- Type-only imports
    - Use `import type` for types. Prefer `export type` for re-exports. Enable ESLint `consistent-type-imports`.

- Nullability
    - Avoid non-null assertions (`!`). Prefer safe narrowing, optional chaining, and guards.

---

## Modules & Imports

- Import order
    - Group: Node builtins → external deps → internal absolute → relative. Alphabetize within groups. No circular deps.

- Named exports
    - Prefer named exports. Avoid default exports for internal code. One module = one primary concept.

- Paths
    - Prefer absolute imports via `baseUrl`/`paths` over long `../../..`. Avoid deep imports into another package’s internals.

- Side effects
    - Side-effect imports only for polyfills or global styles, and document why.

---

## Formatting & Linting (Enforcement)

- Prettier
    - Use `.prettierrc` defaults. Semicolons on, single quotes, trailing commas where valid, print width 100, LF endings, 2‑space indentation.

- ESLint
    - Use `@typescript-eslint` for TS, `eslint-plugin-import` for import hygiene, `eslint-plugin-react` and `eslint-plugin-react-hooks` for frontend, and `eslint-plugin-tsdoc` for TSDoc.
    - Key rules: `consistent-type-imports`, `no-unused-vars` (TS), `no-shadow`, `eqeqeq`, `curly`, `no-console` (except in scripts), `@typescript-eslint/no-floating-promises`, `@typescript-eslint/explicit-module-boundary-types`, `react/jsx-uses-react` (as needed), `react-hooks/rules-of-hooks`, `import/order`, `import/no-default-export` (except for Vite/CLI entrypoints).

- Hooks
    - Husky pre-commit runs Prettier check and ESLint. CI runs typecheck, lint, tests, and coverage gates.

---

## Error Handling & Logging

- Errors
    - Throw `Error` subclasses with machine-readable `code` where relevant. Never throw strings. Don’t swallow errors; rethrow with context using `new Err(msg, { cause })`.

- Fastify error shape
    - Convert domain errors to HTTP responses in a centralized error handler. Map validation errors to 400, auth to 401/403, conflicts to 409, rate limits to 429.

- Logging
    - Use `pino` via the configured logger. No `console.log` in app code.
    - Log at correct levels: debug (diagnostics), info (state changes), warn (unexpected but handled), error (failed operation). Never log secrets; rely on logger redaction.

---

## Backend (Fastify)

- Plugins & routes
    - Encapsulate features as Fastify plugins. Register routes with JSON Schema or Zod->schema for body/query/params and typed replies.

- Request handling
    - Keep handlers thin; delegate to services. Validate inputs at the edge and return typed DTOs.

- Lifecycle
    - Expose `buildApp()` for tests and provide graceful shutdown handlers for SIGINT/SIGTERM. Health endpoints: `/healthz/live` and `/healthz/ready`.

---

## Frontend (React + Vite)

- Components
    - File names: `PascalCase.tsx` for components. One component per file when feasible. Keep components pure; derive UI from props/state.

- Props & state
    - Define `Props` as explicit `type`. Avoid `any`. Use `React.FC` only when children typing is needed; otherwise prefer function components with typed props.

- Hooks
    - Custom hooks start with `use` and encapsulate a single concern. Follow `react-hooks/rules-of-hooks`.

- Lists & keys
    - Use stable keys, not indices.

- Styling
    - Use the project’s CSS-in-JS (`@stitches/react`) conventions; avoid inline style objects for dynamic styles unless trivial.

---

## API Contracts & DTOs

- Shared types
    - Define request/response DTOs under `src/types/`. Keep DTOs stable and versioned when necessary.

- Validation
    - Validate external inputs with Zod at boundaries. Narrow unknown to known types.

---

## Miro SDK Usage

- SDK client
    - Use the centralized client and retry helper with jitter and `Retry-After` support. Do not hand-roll per-call backoff.

- Iteration
    - Prefer async iterators (`for await`) for list endpoints to avoid loading all pages.

- Webhooks
    - Verify signatures using the official helper (or our utility until available). Only accept JSON content with size limits.

---

## Tests (Vitest)

- Structure
    - Co-locate unit tests near implementation or place under `tests/`. Name files `*.test.ts[x]`.

- Determinism
    - No live network/file I/O in unit tests. Mock or fake. Control timers with `vi.useFakeTimers()` and drain them.

- Coverage
    - Maintain coverage thresholds (statements/branches/functions/lines) as configured; raise over time to meet project gates.

---

## Documentation & Comments

- TSDoc
    - Exported functions, classes, and modules include TSDoc explaining why, params, returns, and error conditions.

- TODOs
    - Use actionable TODOs: `// TODO(@user): description (issue #123)`; keep up to date or remove.

---

## Git, Commits, and Reviews

- Conventional Commits
    - Use `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, `ci:` with optional scope.

- PRs
    - Small, focused changes. Provide summary, rationale, and testing notes. Link issues.

---

## Examples

Type‑only imports and DTOs

```ts
import type { Board } from '@mirohq/miro-api'
import { z } from 'zod'

export const CreateCard = z.object({ title: z.string().min(1), description: z.string().optional() })
export type CreateCard = z.infer<typeof CreateCard>
```

Fastify route with validation and error mapping

```ts
app.post('/api/cards', { schema: { body: CreateCard } }, async (req, reply) => {
    const input = CreateCard.parse(req.body)
    const card = await service.createCard(input)
    return reply.code(201).send(card)
})
```

Promise handling without floating promises

```ts
// bad
doSomethingAsync()

// good
await doSomethingAsync()

// fire-and-forget in event handlers
button.addEventListener('click', () => {
    void trackClick()
})
```

React component props and naming

```tsx
type UserCardProps = { user: User; onSelect?: (id: string) => void }
export function UserCard({ user, onSelect }: UserCardProps) {
    return (
        <article>
            <h3>{user.name}</h3>
            <button onClick={() => onSelect?.(user.id)}>Select</button>
        </article>
    )
}
```

---

## Enforcement Summary

- Autoformat with Prettier; lint with ESLint (TS + React + import + tsdoc); typecheck in CI; Husky pre-commit runs format and lint.
- No default exports (except entrypoints). No non-null assertions. Use type‑only imports. Validate external inputs with Zod. Use pino for logging.

For architectural guidance, see [docs/ARCHITECTURE.md](ARCHITECTURE.md) and [docs/node-architecture.md](node-architecture.md).
