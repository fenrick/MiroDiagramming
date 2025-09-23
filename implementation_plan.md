# Implementation Plan

Purpose: Track pending improvements for the browser‑only app. This plan now excludes all legacy server/Prisma items; those have been retired with the backend and, where useful, archived under `docs/archive/`.

Guiding principle: compose established frontend tooling (Vite, React, Miro Web SDK) instead of rebuilding infrastructure.

## Scope

This plan covers the React panel, Web SDK helpers, quality gates, and UX. There is no Node server, no Prisma schema, no job queue, and no webhooks.

## Security

Security is limited to client concerns (e.g., safe DOM usage). No HTTP handlers or webhooks remain.

## Reliability & Operations

Static hosting only. Use host‑level health checks for `index.html` as needed.

## Recent Maintenance

- [Done] Remove deprecated Python backend sources under `src/miro_backend/**` and stray `__pycache__`.
- [Done] Remove stale top-level `server/` folder (no backend remains).
- [Done] CI cleanup: remove Prisma/migrate steps and legacy client typecheck job; keep frontend-only gates (`format`, `lint`, `typecheck`, `test`, `build`).
- [Done] Break board import cycle by making `board-cache` require an explicit board param; adjust callers.
- [Done] Reduce cognitive complexity in `logger`, `sticky-tags`, `Toast`, and `use-excel-sync` to satisfy lints.
- [Done] Replace nested ternary in sticky-tags toast message with explicit branching.
- [Done] Remove `tabIndex` from non-interactive App container; updated `useKeybinding` to bind at `document` when unfocused. Added a focused unit test for the hook under `tests/client`.
- [Done] Migrate `scripts/generate-client.ts` to top-level await with ESM-safe path resolution; removed redundant conditional.
- [Done] `src/index.ts` uses top-level registration for Miro UI handlers (no async init wrapper).
- [Done] A11y polish: ButtonToolbar avoids index-based keys; CommandPalette uses native buttons; EmptyState and CardsTab loading use `<output aria-live>`; Modal backdrop is a button and `<dialog>` has native semantics.

<!-- Removed: Queue & Persistence (backend-only) -->

<!-- Removed: Miro API & Webhooks (backend-only) -->

<!-- Removed: backend REST endpoints, webhooks, and retry handlers -->

## Type Safety & SDK Usage

- Replace broad `Record<string, unknown>` usage
    - What’s needed: Adopt precise SDK types or explicit DTOs in public/service APIs; remove wide index signatures.
    - Where: `src/services/miroService.ts` and similar services.
    - DoD: No `Record<string, unknown>` in service APIs; typecheck and tests validate correctness.

- Import frontend SDK types
    - What’s needed: Use `@mirohq/websdk-types` in frontend components/hooks for stronger typing.
    - Where: `src/**`.
    - DoD: Frontend compiles with stronger typing; no implicit anys in these areas.

-- Enable `noImplicitAny` - What’s needed: Turn on `noImplicitAny` and resolve resulting errors across the frontend. - Where: `tsconfig.json` (and any client tsconfigs), and code in `src/**`. - DoD: `npm run typecheck` passes with `noImplicitAny` enabled.

-- Define shared types - What’s needed: Centralize commonly used data shapes for UI and board helpers. - Where: `src/types/` (new or expanded module); refactor imports to use shared types. - DoD: Duplication removed; typecheck and tests pass.

- Frontend Miro SDK adapter (no globals)
    - What’s needed: Introduce a `BoardAdapter` wrapper for Miro SDK access and inject it where needed to avoid direct `globalThis` references.
    - Where: `src/board/board-adapter.ts` (new), refactors in `src/**`.
    - DoD: All SDK calls go through adapter; tests stub adapter; no direct global casts remain.

## Linting & Formatting

- Expand lint script scope
    - What’s needed: Lint `src/`, `tests/`, and `scripts/`; fail on warnings to keep signal strong.
    - Where: `package.json` (`scripts.lint`).
    - DoD: `npm run lint` covers all paths and exits non‑zero on warnings.

- Fix ESLint warnings and parsing issues
    - What’s needed: Resolve lints across tests and client code, especially JSX/ESM parsing in style‑presets tests.
    - Where: Codebase‑wide; specifically `tests/client/style-presets.test.ts[x]`.
    - DoD: `npm run lint` clean with zero warnings.

- Maintain formatting
    - What’s needed: Ensure Prettier config is applied consistently; run formatter in CI/local.
    - Where: Project root via `npm run format:write` (or equivalent).
    - DoD: Formatting stable and enforced where configured.

- Type-only imports enforcement
    - What’s needed: Enable and auto-fix `consistent-type-imports` to prefer `import type` for types; migrate existing imports.
    - Where: `eslint.config.mjs`; code in `src/**`, `tests/**`.
    - DoD: No mixed type/value imports; lint clean for consistent-type-imports.

- Import order: alphabetize + internal groups
    - What’s needed: Configure `import/order` to alphabetize within groups and recognize internal aliases (`@/*` or `src/*`) via `pathGroups`.
    - Where: `eslint.config.mjs`.
    - DoD: Imports are grouped and alphabetized; no import/order warnings.

- Import hygiene: cycles and extraneous deps
    - What’s needed: Add `import/no-cycle` and `import/no-extraneous-dependencies` with sensible overrides; fix any violations.
    - Where: `eslint.config.mjs`, `package.json` adjustments as needed.
    - DoD: Lint passes with no cycles or extraneous dependency errors.

## Style Guide Compliance

- Enforce ESLint rules per style guide
    - What’s needed: Configure rules `consistent-type-imports`, `import/order`, `import/no-default-export` (allow exceptions for Vite/CLI), `@typescript-eslint/no-floating-promises`, `@typescript-eslint/explicit-module-boundary-types`, `no-console` (allow in scripts), `curly`, `eqeqeq`.
    - Where: `eslint.config.mjs` (or `.eslintrc.*`).
    - DoD: `npm run lint` passes and catches violations; CI enforces the rules.

- Add React linting plugins
    - What’s needed: Add `eslint-plugin-react` and `eslint-plugin-react-hooks` with recommended configs for files under `src/**`.
    - Where: `package.json` devDependencies and `eslint.config.mjs`.
    - DoD: Frontend lint catches hook rule violations and JSX best practices.

- Require TSDoc on exported APIs
    - What’s needed: Add `eslint-plugin-tsdoc` and enable errors for invalid/missing TSDoc on exported functions/classes.
    - Where: `package.json` (devDependency) and `eslint.config.mjs`.
    - DoD: Lint fails on missing/invalid TSDoc; key modules documented.

- Prefer named exports internally
    - What’s needed: Refactor modules using default exports to named exports where feasible; add allowlist for required defaults (Vite entry, CLI).
    - Where: `src/**` modules with default export.
    - DoD: No default exports remain except allowlisted; lint passes.

- TypeScript strictness flags
    - What’s needed: Ensure `tsconfig.json` and `tsconfig.client.json` enable `noImplicitAny`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `useUnknownInCatchVariables`, `noPropertyAccessFromIndexSignature`.
    - Where: `tsconfig.json`, `tsconfig.client.json`.
    - DoD: `npm run typecheck` passes with flags enabled.

- Absolute import paths
    - What’s needed: Configure `baseUrl` and `paths` for absolute imports; add lint guard to discourage deep relative paths; migrate imports gradually.
    - Where: `tsconfig.json`, `eslint.config.mjs`, code in `src/**`.
    - DoD: New code uses absolute imports; lint warns on long relative paths; initial migration completed.

- Husky pre‑commit runs lint
    - What’s needed: Extend the pre‑commit hook to run `npm run lint` in addition to Prettier check.
    - Where: `.husky/pre-commit`.
    - DoD: Commits are blocked on lint errors locally.

## Aura UX Alignment (Frontend)

- Sections, spacing, and rhythm [Done]
    - What’s needed: Unified SidebarSection padding and row gaps; ScrollArea vertical padding; stable scrollbars; list spacing.
    - Where: `src/ui/components/SidebarSection.tsx`, `ScrollArea.tsx`, `assets/style.css`.
    - DoD: Consistent vertical rhythm across tabs; no cramped sections; lists and callouts scan cleanly.

- Empty/Loading states [Done]
    - What’s needed: EmptyState for empty views; Skeleton for long operations (imports, jobs, cards).
    - Where: `src/ui/components/{EmptyState,Skeleton}.tsx`; used in Cards/Structured/JobDrawer.
    - DoD: Users see clear empty guidance and subtle skeletons during work.

- Drawers a11y polish [Done]
    - What’s needed: aria-label/aria-labelledby on dialogs; polite announcements.
    - Where: `components/{DiffDrawer,JobDrawer}.tsx`.
    - DoD: Screen readers announce dialog names and progress updates.

- Inline guidance (InfoCallout) [Done]
    - What’s needed: Short, action-focused tips in Search, Arrange, Style, Excel; notes in Frames; advanced guidance in Structured.
    - Where: Affected tabs under `src/ui/pages`.
    - DoD: Tips are concise, optional, and do not crowd the UI.

- Field spacing normalization [Done]
    - What’s needed: Align InputField spacing to SelectField; avoid ad‑hoc margins.
    - Where: `ui/components/InputField.tsx`.
    - DoD: Uniform spacing between fields in all tabs.

- Advanced options grouping (Structured) [In progress]
    - What’s needed: Tighter grouping of related numeric/select controls with consistent gaps; brief context note.
    - Where: `ui/pages/StructuredTab.tsx` (Advanced `<details>` block).
    - DoD: Advanced panel reads as cohesive groups; spacing aligns to tokens.

- Keyboard & focus order checks [Planned]
    - What’s needed: Verify Tabs → first section → fields → StickyActions order; add tests where useful.
    - Where: tests under `tests/client/*`.
    - DoD: Keyboard-only users can operate core flows easily; tests pass.

- Typography sweep [Planned]
    - What’s needed: Confirm small/body text sizes for Paragraph and lists; eliminate hard-coded font sizes where possible.
    - Where: `ui/components/Paragraph.tsx`, help lists, tips.
    - DoD: Text sizes align with Aura tokens; no stray px values.

- Re-enable hooks post-UX pass [Planned]
    - What’s needed: Restore Husky hooks (core.hooksPath) and commitlint once UX iteration stabilizes.
    - Where: repo git config / `.husky`.
    - DoD: CI/local hooks enforce lint/format/commit style again.

- No non‑null assertions
    - What’s needed: Enable `@typescript-eslint/no-non-null-assertion` and refactor code to use guards/narrowing.
    - Where: `eslint.config.mjs`, code in `src/**`.
    - DoD: Lint clean with rule enabled; code uses safe checks.

<!-- Removed: Backend input validation (no routes/webhooks/env parsing) -->

- Frontend component/file naming
    - What’s needed: Audit and align filenames to `PascalCase.tsx` for components, `kebab-case.ts` for utilities.
    - Where: `src/**`.
    - DoD: Naming matches guide; imports updated; build and tests pass.

- Logger usage policy
    - What’s needed: Replace stray `console.*` in app code with the shared logger; ensure redaction covers sensitive headers/tokens.
    - Where: `src/**` (app code), `src/config/logger.ts`.
    - DoD: No `console.*` in app code (scripts allowed); redaction list updated and verified.

- Promise handling hygiene
    - What’s needed: Fix floating promises by awaiting or explicitly marking `void` for fire‑and‑forget handlers.
    - Where: `src/**` where async is used.
    - DoD: Lint clean for `no-floating-promises`; tests unaffected.

- Ban double assertions in app code
    - What’s needed: Enforce rule preventing `as unknown as` in `src/**`; provide typed helpers/guards and migrate any remaining occurrences. Keep tests override only where necessary.
    - Where: `eslint.config.mjs` rule; code in `src/**`.
    - DoD: `rg` finds zero `as unknown as` in app code; lint blocks regressions.

- ESLint resolver for path aliases
    - What’s needed: Wire `eslint-import-resolver-typescript` to resolve TS `paths`/`baseUrl` and avoid false positives.
    - Where: `eslint.config.mjs`, devDependencies.
    - DoD: Lint resolves `@/*` or `src/*` imports without errors.

- Barrel hygiene and named exports
    - What’s needed: Audit barrels to avoid cycles; enforce `import/no-default-export` with allowlist; prefer named exports.
    - Where: `eslint.config.mjs`; code in `src/**`.
    - DoD: No default exports outside allowlist; no cycles via barrels.

- React accessibility linting
  [Planned]

## Frontend UX Quality

- BoardAdapter + Context (remove globals)
    - What’s needed: Introduce `BoardAdapter` wrapping Miro Web SDK access and provide it via React context. Replace direct `globalThis.miro`/`window.miro` references in UI and hooks (`StructuredTab`, `templates.ts`, etc.) with the adapter.
    - Where: `src/board/board-adapter.ts` (new), `src/app/App.tsx` provider, refactors under `src/**`.
    - DoD: No `globalThis.miro` occurrences in app code; tests stub the adapter; typecheck and client tests pass.

- Modal: replace custom trap with design-system dialog
    - What’s needed: Swap the bespoke `Modal` for the design-system/Radix Dialog primitives (proper aria attributes, focus trap, ESC handling). Remove manual `keydown` listeners and `document.querySelector` logic in favor of library behavior.
    - Where: `src/ui/components/Modal.tsx` and all consumers.
    - DoD: Dialog opens/closes via props, traps focus, announces title; a11y tests cover ESC, Tab/Shift+Tab cycling, and backdrop click/Enter/Space to close.

- Keyboard shortcuts scoping
    - What’s needed: Scope global `window` keydown handlers (e.g., panel Ctrl+Alt+1..N in `App.tsx`) so they are active only when the panel is focused/visible; avoid conflicts with Miro shortcuts. Prefer event delegation within the panel root.
    - Where: `src/app/App.tsx`, shared `useKeybinding` hook (new in `src/core/hooks/useKeybinding.ts`).
    - DoD: Keybindings work only when the app panel has focus; tests simulate focus changes and verify no global leakage.

- Replace `document.getElementById` focus jumps with refs
    - What’s needed: In places like `JobDrawer`, store refs to items and move focus via ref rather than DOM id queries. Keep focus outlines visible for accessibility.
    - Where: `src/components/JobDrawer.tsx` and similar.
    - DoD: No `document.getElementById` in app code; tests verify focus moves to first failed op.

- Non‑null assertions removal (frontend pass)
    - What’s needed: Remove `!` assertions in `App.tsx` and other frontend files; add guards or invariant helpers to satisfy strict typing.
    - Where: `src/**`.
    - DoD: `rg "\!\]"` and `rg "!\)"` find zero meaningful non‑null assertions; typecheck passes.

- A11y audit and tests
    - What’s needed: Add targeted tests for roles, names, and live regions (e.g., `SyncStatusBar` uses `role="status"` with polite updates). Validate labels for all inputs and controls; ensure `summary` reflects `aria-expanded` state.
    - Where: `tests/client/**` and component props in `src/ui/components/**`.
    - DoD: a11y tests pass; no axe violations in critical screens (informational only if axe is added).

- Debounce and timers hygiene
    - What’s needed: Ensure all `setInterval`/`setTimeout` have cleanup paths; replace ad‑hoc debounce (e.g., search handlers) with a small `useDebouncedEffect` hook for consistency.
    - Where: `src/components/SyncStatusBar.tsx`, `src/ui/hooks/use-search-handlers.ts`, others.
    - DoD: Hook used consistently; tests assert timers are cleared on unmount.

- Code splitting for tabs
    - What’s needed: Lazy‑load heavy tabs (Structured, Excel) using `React.lazy` + `Suspense` with existing skeletons to reduce initial panel load.
    - Where: `src/app/App.tsx`, `src/ui/pages/**`.
    - DoD: Initial bundle decreases; skeletons render during lazy load; tests updated to await suspense.

- Error boundary
    - What’s needed: Wrap the panel with an error boundary that shows a friendly error with a “Try again” action and logs details (without PII).
    - Where: `src/app/App.tsx` (new `ErrorBoundary` component under `ui/components`).
    - DoD: Uncaught render errors show the boundary; tests simulate a throwing component and assert fallback UI.

- Jest‑DOM matchers and DS provider in tests
    - What’s needed: Import `@testing-library/jest-dom/vitest` in test setup; ensure components that rely on DS/Radix context are wrapped in minimal providers/mocks so tests don’t fail on internal assertions (e.g., SliderThumb within Slider).
    - Where: `tests/client/setupTests.ts` (added), test utilities.
    - DoD: Client test failures for `.toBeInTheDocument()` and Slider context are resolved; CI green.
    - What’s needed: Add `eslint-plugin-jsx-a11y` with recommended rules; fix high-signal violations.
    - Where: `package.json` devDependency and `eslint.config.mjs`; code in `src/**`.
    - DoD: a11y lint passes; obvious accessibility issues addressed.

## Testing & Coverage

- Env var error handling tests
    - What’s needed: Tests for missing required envs throwing descriptive errors; tests for default `PORT` and JSON array parsing.
    - Where: `src/config/env.test.ts`.
    - DoD: Tests pass and cover edge cases for env parsing and defaults.

- Error handler coverage
    - What’s needed: Cover non‑validation error paths; verify custom HTTP codes and response shapes.
    - Where: `src/config/error-handler.test.ts`.
    - DoD: Tests assert correct codes/payloads for various error types.

<!-- Removed: change queue tests (no queue) -->

- Idempotency repository TTL tests
    - What’s needed: Mock `Date.now` to verify TTL cleanup; confirm duplicate keys extend TTL.
    - Where: `src/repositories/idempotencyRepo.test.ts`.
    - DoD: TTL behavior validated; duplicates extend TTL as expected.

- Client tests stability
    - What’s needed: Fix timeouts in `search-tab` tests for debounced search and clear‑query; fix parsing issues in `style-presets` tests (ensure JSDOM env, correct ESM/JSX handling, proper `.tsx`).
    - Where: `tests/client/search-tab.test.tsx`, `tests/client/style-presets.test.ts[x]`.
    - DoD: `npm test` runs without Vitest parse failures and with flake‑free timeouts.

- Coverage thresholds in Vitest
    - What’s needed: Set `test.coverage.thresholds` for statements/branches/functions/lines ≥ 80; add CI coverage run that fails below thresholds.
    - Where: `vitest.config.ts`, `.github/workflows/ci.yml` (coverage step).
    - DoD: Local and CI runs fail if coverage drops below thresholds; coverage report generated.

- Quality Gates alignment follow‑up
    - What’s needed: Plan to raise thresholds to meet project Quality Gates (target ≥ 90%). Track as a follow‑up in `implementation_plan.md` when ready.
    - Where: `vitest.config.ts` (future change), `implementation_plan.md` (tracking).
    - DoD: Thresholds eventually updated to ≥ 90% with tests supporting the increase.

## Developer Experience

- Production Dockerfile
    - What’s needed: Multi‑stage build (builder → runner) on `node:20-alpine`; build Vite + tsc; run with `node dist/server.js`.
    - Where: `Dockerfile` at repo root; adjust `package.json` scripts if needed.
    - DoD: `docker build` succeeds; `docker run -p 3000:3000` serves the app.

- Authoritative `.env.example`
    - What’s needed: List all required/optional env vars with comments (e.g., `PORT`, `DATABASE_URL`, `MIRO_CLIENT_ID/SECRET/REDIRECT_URL`, `MIRO_WEBHOOK_SECRET`, `QUEUE_*`, any `SESSION_*`).
    - Where: `.env.example` at repo root.
    - DoD: New contributors can `cp .env.example .env` and boot the app without guesswork.

## Documentation

- Keep plan current
    - What’s needed: Mark completed items as [Done] and ensure `implementation_plan.md` reflects pending work.
    - Where: `implementation_plan.md`.
    - DoD: Only pending work remains listed; updated alongside related PRs.

- Document server lifecycle [Done]
    - What’s needed: Describe server start/stop and graceful close behavior.
    - Where: `docs/node-architecture.md` (Server Lifecycle section).
    - DoD: Docs include lifecycle notes; aligns with `buildApp()`/`startServer()`.

<!-- Removed: queue persistence strategy -->

    - What’s needed: Capture persistence design, trade‑offs, and operational notes.
    - Where: `docs/node-architecture.md`.
    - DoD: Clear section explaining persistence choices and recovery.

- Operational runbook [Done]
    - What’s needed: `docs/runbook.md` focuses on build, preview, deploy, and static host checks.
    - Where: `docs/runbook.md`.
    - DoD: Runbook exists and is referenced by deployment docs.

- Update retry semantics in docs
    - What’s needed: N/A (no HTTP client/backoff layer in the frontend-only app).
    - Where: `docs/node-architecture.md`.
    - DoD: Documentation reflects current retry and telemetry patterns.

## Improvement Backlog

## UX Alignment (Aura)

- Normalize form controls to design-system `Form` components and field groups. [Planned]
- Add loading states to long operations (board scan, imports, diff). [Planned]
- Audit keyboard navigation and focus order across Tabs, modals, and lists; add a11y tests. [Planned]

<!-- Removed: Jobs & Backend Infrastructure (no server or SSE) -->

## UX & Navigation

- First‑run onboarding tour [Planned]
    - What’s needed: Contextual coach marks for the three core actions (Import, Layout, Sync) and a “Try with sample data” path.
    - Where: `src/pages/HelpTab.tsx`, new `src/ui/components/CoachMarks.tsx`, integrate with `App.tsx` first‑run check (board metadata / localStorage).
    - DoD: First open shows 3–5 step tour, skippable and never auto‑repeats; sample board creates non‑destructive widgets for demo.

- Command palette and shortcuts [Done]
    - What’s needed: Add `Cmd/Ctrl+K` palette to run actions (search, layout, style presets, selection ops). Document shortcuts.
    - Where: `src/ui/components/CommandPalette.tsx` (new); wire into existing actions in `pages/` and hooks.
    - DoD: Palette opens with `Cmd/Ctrl+K`; arrow/Enter navigates; actions execute; help lists available shortcuts.

- Expand command palette actions [Planned]
    - What’s needed: Surface search, layout, style preset, and selection operations within the command palette.
    - Where: `src/app/App.tsx`, `src/ui/components/CommandPalette.tsx`.
    - DoD: Palette offers common actions beyond tab switching; tests cover each action.

- Consistent panel IA and tabs [Planned]
    - What’s needed: Audit tab taxonomy; prioritize common tasks; reduce to 5–7 top‑level tabs; move advanced items to nested tabs with clear labels.
    - Where: `src/ui/pages/tabs.ts`, `tab-definitions.ts`, each Tab component.
    - DoD: Tabs ordered by frequency; labels concise; tree fits Miro panel height without scrolling on 768px.

- Settings panel (per board) [Planned]
    - What’s needed: Consolidate toggles for telemetry opt‑in, default layout options, import behaviors; persist in board metadata.
    - Where: New `SettingsTab.tsx`; persistence via existing metadata utilities.
    - DoD: Settings persist per board; toggle changes reflected immediately.

- Context menu integration [Planned]
    - What’s needed: Provide right‑click context menu entries for common actions when supported by Miro SDK.
    - Where: Miro SDK integration points and UI action handlers.
    - DoD: Users can trigger key actions from selection context without opening the panel.

## Feedback & Error Handling

- Loading and skeleton states [Planned]
    - What’s needed: Add skeletons/placeholders for remaining imports and diff views; avoid spinner‑only states.
    - Where: pages invoking async work.
    - DoD: Each async view renders skeleton within 100ms; shimmer duration ≤ 400ms motion token.

- Job Drawer UX overhaul [Planned]
    - What’s needed: Unify progress bars, step list, errors, and retry in `JobDrawer`; add “Copy error details” and “Report issue”.
    - Where: `src/components/JobDrawer.tsx`, `DiffDrawer.tsx` integration.
    - DoD: Users see granular progress and can retry/cancel; detailed error view available and copyable.

- Error handling microcopy and remediation [Planned]
    - What’s needed: Human‑friendly error titles, causes, and next steps (e.g., “Reconnect Miro”); consistent toasts vs inline errors.
    - Where: Shared error mapper in `src/core/*` and components.
    - DoD: Errors are actionable; retry paths visible; no raw exception text leaks.

- Empty states with guidance [Planned]
    - What’s needed: Purposeful empty views with illustration, one primary CTA, and link to Help.
    - Where: Each tab initial state.
    - DoD: Empty screens helpful and consistent; tracked via telemetry.

- Offline/network state & retry UX [Planned]
    - What’s needed: Show network banner and auto‑retry with backoff; clear resume messaging.
    - Where: Global app shell and network hook.
    - DoD: Temporary disconnects don’t lose user intent; banner disappears on recovery.

## Selection & Editing

- Selection‑aware quick actions [Planned]
    - What’s needed: Show context ribbon when selection changes (group, align, style preset, tag apply, layout selection).
    - Where: `src/components/SyncStatusBar.tsx` or new `QuickActions.tsx`; hook into `useSelection`.
    - DoD: Selecting items reveals context actions; keyboard access works; actions disabled when invalid.

- Search & filter UX upgrade [Planned]
    - What’s needed: Fuzzy search with highlight and keyboard navigation; filter by type/tag; enable “jump to on board”.
    - Where: `src/ui/pages/SearchTab.tsx`, `node-search.ts`, `search-tools.ts`.
    - DoD: Query highlights matches; Up/Down selects result; Enter zooms on board; filters persist per board.

- Style presets: preview and apply [Planned]
    - What’s needed: Add visual previews for presets with hover/keyboard preview‑on‑selection; allow “apply to selection”.
    - Where: `src/ui/style-presets.ts`, `StyleTab.tsx`.
    - DoD: Hover previews selection without commit; click applies; keyboard left/right cycles; undo supported.

- Layout tooling improvements [Planned]
    - What’s needed: Live layout preview with ghost frames; “apply to selection”; layout constraints in UI.
    - Where: `src/core/graph/layout-*`, `LayoutEngineTab.tsx`.
    - DoD: Preview toggles on/off; apply respects constraints; visible guidance for invalid selections.

## Performance & Scalability

- Performance: virtualization & progressive rendering [Planned]
    - What’s needed: Virtualize long lists (results, diff); debounced interactions; chunked board scanning; show progress.
    - Where: Search/Results lists, DiffDrawer, board scanning services.
    - DoD: 60fps interactions on 5k+ items; time‑to‑interactive < 200ms for panel.

## Accessibility & Internationalization

- Keyboard navigation & focus management [Planned]
    - What’s needed: Ensure all interactive controls reachable via keyboard; visible focus; modal focus trap; `Esc` to close.
    - Where: Modal, TabBar, Search results, JobDrawer.
    - DoD: Keyboard‑only flow completes core tasks; tests include a11y checks.

- Internationalization scaffold [Planned]
    - What’s needed: Wrap copy in i18n; extract messages; enable locale switch for future translations.
    - Where: Lightweight i18n utility, message catalogs, replace literals.
    - DoD: English catalog complete; infrastructure supports adding locales without code changes.

---

---

Execution guidance:

- Prefer small, reviewable PRs grouped by section above.
- Add/update tests alongside behavior changes.
- Keep changes minimal and avoid incidental refactors.
- Test utilities for Miro SDK
    - What’s needed: Provide a default `miro` global stub in test setup and helpers to customize board methods per test; add a `renderWithProviders` utility that applies theme classes and any required context providers.
    - Where: `tests/client/setupTests.ts`, `tests/client/test-utils.tsx` (new).
    - DoD: Client tests no longer fail with `miro is not defined`; components render under a consistent provider/theme wrapper.

- Update existing tests for dialog semantics
    - What’s needed: Align modal tests with explicit `role="dialog"` and aria attributes; avoid brittle assumptions about attributes.
    - Where: `tests/client/modal.test.tsx` (updated).
    - DoD: Modal tests pass and reflect current a11y semantics.
