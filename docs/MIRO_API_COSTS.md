# Miro API Costs & Caching Strategy

_Version 2025-09-18_

---

## 0 Purpose

Summarise how the client reduces calls to high-cost Web SDK operations now that all work happens in the browser.

## 1 Cost Summary

The Web SDK internally maps to REST endpoints with the following indicative costs:

| SDK call                    | Estimated cost\*        |
| --------------------------- | ----------------------- |
| `miro.board.get({ type })`  | ~500 points             |
| `miro.board.getSelection()` | ~500 points             |
| `miro.board.get({ id })`    | ~500 points             |
| Widget mutations (`sync`)   | Variable (typically 50) |

\*Subject to change per Miro’s rate limits. We optimise assuming the classic REST costs.

## 2 Strategies

1. **Client-side caching** – `board/board-cache.ts` caches widget collections by type and the current selection. Subsequent calls reuse cached results until explicitly reset.
2. **Targeted fetches** – Most features request only the widget types they need (`{ type: 'card' }`, `{ type: 'tag' }`) rather than fetching entire boards.
3. **Batch creation** – `CardProcessor` and `TemplateManager` create groups of widgets in a single pass and avoid redundant `get` calls by retaining references returned from `createShape`/`createCard`.
4. **Lazy metadata updates** – Sticky tag helpers only sync widgets when tags actually change. Optimistic operations roll back on failure without triggering additional reads.
5. **No duplicate polling** – Jobs queues were removed. Long-running operations execute directly and surface toast notifications; no `/api/jobs` polling remains.

## 3 Opportunities

- Extend `board-cache.ts` to persist results across sessions via `miro.board.storage` if rate limits become an issue.
- Record lightweight metrics (counts, durations) in telemetry to spot expensive flows.
- Investigate incremental selection updates via realtime events to keep the cache warm without high-cost fetches.

Overall, keeping all logic client-side makes rate-limit behaviour predictable—each feature controls when it touches the board API, and caches avoid unnecessary calls.
