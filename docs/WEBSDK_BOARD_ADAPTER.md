# Web SDK Board Adapter Pattern

Decision date: 2025-09-28

Goal: standardize how app code accesses `miro.board` to improve testability, error handling, and future flexibility.

## Current State

- Utilities exist in `src/board/board.ts` (`getBoard`, `ensureBoard`, `getBoardWithQuery`).
- Some modules call `globalThis.miro?.board` or `miro.board` directly.

## Pattern

Introduce a minimal adapter with an injectable surface for UI code, keeping direct SDK calls inside `src/board/**` helpers.

```ts
// src/board/board-adapter.ts (proposed)
export interface BoardAdapter {
    get(): BoardLike
    getWithQuery(): BoardQueryLike
}

export const DefaultBoardAdapter: BoardAdapter = {
    get: () => getBoard(),
    getWithQuery: () => getBoardWithQuery(),
}

// src/app/BoardProvider.tsx (proposed)
const BoardContext = React.createContext<BoardAdapter>(DefaultBoardAdapter)
export function useBoard(): BoardAdapter {
    return React.useContext(BoardContext)
}
```

Usage in UI/hook code:

```ts
const board = useBoard().get()
const items = await board.get({ type: 'shape' })
```

## Benefits

- Testability: swap the adapter with a mock in unit tests.
- Consistency: one path for error messaging when SDK is unavailable (`ensureBoard`).
- Flexibility: future proofing for SDK changes or host adaptations.

## Migration Guide

1. Add `board-adapter.ts` and `BoardProvider` per above.
2. Wrap `App` in a provider once at the root.
3. Replace direct `globalThis.miro`/`miro.board` references in `src/ui/**` and hooks with `useBoard()`.
4. Keep low‑level helpers (`src/board/**`) as the only place that reaches the SDK primitives.

## Done When

- No direct `globalThis.miro` references in UI/hook code.
- Tests stub the adapter for board interactions.
- Typecheck and tests pass.
