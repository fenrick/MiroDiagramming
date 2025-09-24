# Coding Standards (TypeScript + React)

These guidelines keep the client codebase consistent now that everything runs in the browser.

## General Principles

- Prefer immutable data structures and pure functions where practical.
- Use TypeScript's strict mode; avoid `any` and `!` assertions. Narrow types with guards/helpers.
- Keep modules focused: UI components in `ui/`, board logic in `board/`, shared utilities in `core/`.
- Co-locate tests with feature areas in `tests/client/`.

## TypeScript

- Use `import type` for type-only imports.
- Enable exhaustive `switch` statements; handle unexpected cases with `assertNever` helpers.
- Define explicit return types for exported functions/hooks.
- Prefer readonly arrays/records when exposing collections (`readonly T[]`, `Readonly<Record<...>>`).

## React

- Components live under `src/ui/` or `src/components/` and use PascalCase filenames.
- Hooks live under `src/core/hooks/` (shared logic) or alongside pages when highly specific.
- Use function components with React hooks (`useState`, `useEffect`, `useMemo`, etc.).
- Derive UI from props/state; avoid mutating external module state in render paths.
- When accessing the Miro SDK, centralise calls in helpers (`board/board.ts`, `core/utils/shape-client.ts`) to simplify testing.

## Styling

- Prefer `@mirohq/design-system` primitives and tokens.
- When custom styles are required, use Stitches via `@stitches/react` with themed tokens.

## Tests

- Write jsdom tests with Vitest + Testing Library.
- Mock the Miro SDK by stubbing the minimal methods required for each test.
- Keep tests deterministic; avoid reliance on real timers/network.

## File Naming

- Components: `ComponentName.tsx`
- Hooks: `useThing.ts`
- Utilities: `thing-utils.ts`
- Test files mirror source names: `ComponentName.test.tsx`

## Logging

- Use the helpers from `src/logger.ts` (`info`, `debug`, `warning`, `error`).

## Miro SDK Usage

- Always guard access to `window.miro` / `miro.board` to avoid runtime errors when running outside Miro (e.g., tests).
- When mutating widgets, call `maybeSync` or the widget’s `sync` method after setting properties.
- Cache board queries (`board-cache.ts`) when repeated reads are expected.

## Formatting & Linting

- Run `npm run lint` and `npm run format` before committing.
- Prettier handles formatting; ESLint enforces import order, hook rules, and other conventions.
