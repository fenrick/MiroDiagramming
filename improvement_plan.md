# Improvement Plan

Purpose: a concise, ordered backlog of refactors and optimizations to keep the codebase simple, reliable, and easy to maintain.

Status markers: [Planned] to do. Completed items are removed from this list once merged.

## Frontend

- Backend boundary for board reads [Planned]

- Why: reduce client API calls; improve testability.
- Acceptance: minimal backend endpoints added; `shape-client`/`board-cache` progressively switched to server-backed lookups.

- Improve error messages [Planned]

- Why: faster debugging.
- Acceptance: errors include invalid values/context across builder operations.

## Lint, Tests & Quality

- ESLint rules refinement [Planned]

- Why: reduce unsafe casts.
- Acceptance: discourage `as unknown as`; prefer typed helpers or module augmentation.

---

Execution guidance:

- Prefer small, reviewable PRs grouped by section above.
- Add/update tests alongside behavior changes.
- Keep changes minimal and avoid incidental refactors.
