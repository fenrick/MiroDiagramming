# Coding Standards (frontend focus)

## Purpose

- Keep the React/Vite panel consistent, type-safe, and aligned with the broader documentation hierarchy (`docs/CHARHD.md` families and `docs/architecture/ARCHITECTURE.md`).
- Emphasise readability, predictable module boundaries, and minimal runtime surface (no backend logic inside the renderer).

## Architecture & boundaries

- The frontend listens only to typed SDK helpers (`src/board`, `src/core/utils`) and never reaches directly into backend/IPC layers. Treat each helper folder as a boundary with a clean public surface.
- Naming conventions: keep folders and files kebab-case, exports camelCase/PascalCase, and restrict suffixes to meaningful roles (e.g., `*.service.ts`, `*.adapter.ts`). Avoid generic names like `util`/`common` and deep imports; reshape structure via `index.ts` barrels.
- Stateful modules should expose factories, not globals. Side effects belong in dedicated hooks/helpers, avoiding module-level mutations.

## Tooling & gates

- Strict TypeScript (`tsconfig.json`, `tsconfig.eslint.json`) plus ESLint/Prettier (see `eslint.config.mjs`). No inline rule suppressions without an issue reference. Coverage + lint gates run in CI and locally via `pnpm lint`/`pnpm test`.
- Run tests/package checks incrementally; prefer package-scoped Vitest runs and avoid heavy suites unless touching the affected area. Report flaky tests via issues and quarantine them.

## Quality criteria

- New/changed code must maintain ≥80% coverage (lines, branches, functions) for frontend files. Use focused tests or exported `__test__` helpers to raise coverage, but keep runtime exports clean.
- Keep cognitive complexity low (Sonar rule at 8); split functions/components when they gain multiple responsibilities.
- Document any exception (lint, coverage, dependency) with a TODO referencing an issue and re-evaluate frequently.

## TypeScript / React rules

- Use `import type` for type-only imports and prefer readonly collections in public APIs (`readonly string[]`, `Readonly<Record<string, ...>>`). Exported functions/hooks should list return types explicitly.
- Components live under `src/ui`/`src/components`, hooks under `src/core/hooks` (shared) or alongside tightly coupled pages. Keep files under ~300-500 LOC.
- React renders must stay pure: derive output from props/state and guard any external mutation.
- Serialise/deserialise data crossing the board/Web SDK boundary and prefer typed adapters (e.g., `ShapeClient`, `TagClient`). Avoid leaky data from privileged channels.

## Module/package layout

- One concept per module; if a folder gains children, surface it via an `index.ts` facade. Barrel files expose only the public API.
- Top-level folders should map to feature areas; keep nesting ≤3 levels.
- Adhere to one purpose per file and add tests (`*.test.ts`, `*.test.tsx`) adjacent to the source.
- Limit dependencies; runtime code should not pull in Node-only modules.

## Naming & visibility

- Export names: prefer named exports; default exports only when a tool/framework demands them (e.g., Vite entry points). Types/interfaces/classes use PascalCase; functions/variables use camelCase.
- Adopt approved suffixes (`-service`, `-adapter`, `-schema`, `-handler`, `-repo`). Keep API surfaces stable, reshaping with facades rather than changing consumer paths.
- Avoid abbreviations; choose expressive domain language (e.g., `cardProcessor`, not `cp`).

## Async & state

- Use pure helper functions; keep async flows cancellable (`AbortSignal`) and clean up in `finally` blocks.
- Avoid shared mutable state; if unavoidable, wrap inside factories and document lifecycle.

## Errors & sanitisation

- Throw `Error` subclasses with stable `code` values, optionally documenting `cause`. Sanitize and validate all data crossing the Web SDK/preload boundary.
- Map library errors at the boundary; never expose raw ML or third-party error objects to consumers.

## Configuration & flags

- Read env/config once (composition layer) and pass inward as typed objects; validate schemas with tools like Zod and fail fast on invalid config.
- Keep feature flags centralized; avoid scattering `if (import.meta.env…)` across the codebase.

## Testing & documentation

- Test behaviours through public exports and use lightweight fakes for adapters/ports. Avoid heavy mocks.
- Document every module with a brief header explaining its responsibility and any invariants.
- Use snapshots sparingly for stable rendered fragments or schema outputs.

## Formatting & CI

- Run `pnpm lint` and `pnpm format` before commits. CI enforces lint, type, coverage, and ESLint rules (no inline disables without issue refs).
- No deep imports across workspaces; import via published entrypoints.
- Keep `CODE_STYLE.md` updated with new conventions; mention significant changes in PRs tagged `docs(standards)`.
