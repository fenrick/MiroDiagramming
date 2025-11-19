# Testing Strategy

This app is a browser‑only React panel using the Miro Web SDK. For broad, fast, and reliable coverage, focus tests at these seams:

- Core utilities (`src/core/utils/**`) — pure, synchronous logic; high signal per line. Use Node environment.
- React hooks and small components (`src/core/hooks/**`, `src/ui/components/**`) — exercised under jsdom. Mock SDK/globals as needed.
- Board helpers that manipulate plain objects (`src/board/**`) — cover transformation logic with POJOs; do not call the SDK.

Defer or avoid heavy/e2e style tests that require the SDK UI — they are flaky outside Miro.

## Vitest Environments

- `node` project: default for utility and service tests under `tests/node/**`.
- `jsdom` project: client tests under `tests/client/**`.

## Test Authoring Guidelines

- Prefer table‑driven tests for small pure functions (color utils, unit conversions, text utils).
- For hooks that schedule timers (toasts), use fake timers and wrap advances in `act(...)`.
- For optimistic ops, assert apply/rollback/commit ordering and that failures display a toast (mock `pushToast`).
- Keep each test file under ~200 lines; split by module if needed.
