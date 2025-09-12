# Improvement Plan

Purpose: a concise, ordered backlog of refactors and optimizations to keep the codebase simple, reliable, and easy to maintain.

Status markers: [Planned] to do. Completed items are removed from this list once merged.

## Backend

- [Planned] Expand `src/queue/changeQueue.ts` tests for clamping, retry/drop paths, and logging.
- [Planned] Improve `src/repositories/idempotencyRepo.ts` tests to cover `cleanup` TTL cutoff logic.
- [Planned] Refactor `src/server.ts` for testability and add a minimal smoke test.

## Frontend

_(no pending items)_

---

Execution guidance:

- Prefer small, reviewable PRs grouped by section above.
- Add/update tests alongside behavior changes.
- Keep changes minimal and avoid incidental refactors.
