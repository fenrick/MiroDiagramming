# Miro Web SDK Add‑on — Comprehensive Architecture & Expansion Guide  
_Version 2025‑06_

---

## 0  Purpose & Scope  
This document is the authoritative blueprint for building, extending, and operating a **Miro Web‑SDK add‑on**.  
It merges architecture, design‑system usage, performance tuning, quality gates, and future‑proofing guidance into one self‑contained artifact.  
Use it alongside the **Styling, Layout & Formatting Guide** to deliver a seamless, accessible, and maintainable Miro experience.

---

## 1  Architectural Layering  

```
Data → Graph Normalisation → Layout Engine → Board Rendering → UI Orchestration
```

* **Pure Core** (`src/core`) — framework‑agnostic logic; no SDK imports.  
* **Board Adapter** (`src/board`) — translates core DTOs to Miro widgets.  
* **UI Shell** (`src/ui`) — React components built exclusively with `mirotone-react` primitives.  
* **Infrastructure** (`scripts`, `.github`) — build, lint, test, release.

> Layer boundaries guarantee isolation, enabling deterministic tests and safe refactors.

---

## 2  Repository Structure  

```
src/
  core/
    graph/           # GraphProcessor + schema
    layout/          # elk-layout.ts, Web Worker pool
  board/             # BoardBuilder, CardProcessor
  ui/
    components/      # Pure presentation
    hooks/           # State synchronisation, selection
    pages/           # Sidebar tabs
  app/               # DiagramApp entry, routing
tests/               # Jest suites mirror src
.storybook/          # Interactive docs (Storybook MDX)
public/              # Icons, i18n JSON
scripts/             # build, lint, release helpers
```

---

## 3  Core Modules  

| Module | Responsibility | Key APIs |
|--------|----------------|----------|
| **GraphProcessor** | Parse external JSON, normalise nodes/edges, attach ELK hints | `load()`, `getMetadata()` |
| **elk-layout.ts** | Run ELK layered algorithm inside Web Worker pool | `layout(graph)` |
| **BoardBuilder** | Create/update widgets via `miro.board.widgets.*` v2 | `sync(model)`, `remove(ids)` |
| **CardProcessor** | Import card specs, push Command objects to ring buffer | `importCards()`, `undo()`, `redo()` |
| **DiagramApp** | React root; routes, providers, error boundary | `<AppRouter />` |
| **Utilities** | `ui-utils`, `style-tools`, cache helpers | stateless functions |

_Complexity budget: ≤ 70 LOC & ≤ 8 branches per function._

---

## 4  Extending the Add‑on  

### 4.1  Adding a New Widget Type  

1. **Schema** – Extend `GraphProcessor` type definition.  
2. **Layout** – Map ports/edges; provide default ELK options.  
3. **Rendering** – Implement `BoardBuilder.create<Widget>()`.  
4. **Undo** – Add inverse Command in `CardProcessor`.  
5. **Tests** – Unit (core), integration (board), e2e (Cypress).  
6. **Docs** – Storybook story + MDX usage notes.

### 4.2  Plug‑in Points for Complementary Features  

| Feature | Value | Modules Touched |
|---------|-------|-----------------|
| **Collaborative Cursors** | Show remote users’ pointers | `ui/`, SDK `miro.board.getUsers()` |
| **Template Library** | Reuse diagram stencils | `core/graph`, `ui/pages/Templates` |
| **Real‑time Data Bindings** | Reflect external API changes | `core/graph`, `board/BoardBuilder` |
| **Comments & Mentions** | Inline feedback loop | `ui/components/CommentThread` |
| **Minimap** | Faster navigation in large diagrams | `ui/components/Minimap`, viewport sync |

### 4.3  Switching Layout Engines  

* Drop‑in **WebAssembly ELK** for 2× speed when the wasm build stabilises.  
* Alternate **dagre** for light graphs (< 100 nodes).  
* Provide `LayoutStrategy` interface so engines are hot‑swappable via DI.

---

## 5  UI/UX Best Practices  

* **Mirotone alignment** — Use `Stack`, `Cluster`, `Grid`; never raw flex/grid.  
* **State Machines** — Model multi‑step wizards with XState; expose transitions via context providers.  
* **Friction‑free Undo** — Instant preview, rollback within 5 s of import.  
* **Progressive Disclosure** — Hide advanced settings behind accordions.  
* **Accessibility** — WCAG 2.2 AA: contrast ≥ 4.5 : 1, reflow up to 400 % zoom, focus not obscured.  
* **Dark‑mode parity** — Tokens auto‑flip; test in both themes.  
* **NPS Hooks** — Trigger microsurveys after completing key flows (threshold 3 uses).

---

## 6  Quality, Testing & CI/CD  

### 6.1  Gates  

| Layer | Tooling | Threshold |
|-------|---------|-----------|
| Core  | Jest + stryker | 90 % line + branch |
| UI    | Cypress + Axe | No critical a11y violations |
| Build | ESLint, Stylelint, Prettier | Zero errors |
| Metrics | SonarQube | Complexity ≤ 8 |  

### 6.2  Pipeline  

1. **Pre‑commit** – lint, type‑check, unit tests.  
2. **CI** – full test matrix (Node 18/20).  
3. **Preview** – Deploy static Storybook docs & feature‑flagged add‑on to staging team.  
4. **Release** – semantic‑release, changelog, Git tag, Chrome Store zip.

---

## 7  Performance & Scalability  

* Web Worker pool size = `navigator.hardwareConcurrency - 1 (≤ 4)`.  
* Cache expensive layouts in `IndexedDB` keyed by graph hash.  
* Incremental board updates (diff‑sync) instead of full re‑render.  
* WASM switch toggled by feature flag for gradual rollout.  
* Telemetry via `posthog-js` to measure layout time, error rate.

---

## 8  Security & Privacy  

* OAuth scopes limited: `boards:write`, `team:read`.  
* CSP: `script-src 'self' blob:`; disallow `eval`.  
* Sanitise third‑party JSON before rendering.  
* Respect Miro API rate limits (current: 60 req/min per token).  
* No PII stored; cache keys are SHA‑256 hashes.

---

## 9  Progressive Delivery & Feature Flags  

* **LaunchDarkly** ‑ style flags wrap high‑risk modules (WASM, new widget types).  
* Flags auto‑expire via CLI job; technical debt prevented.  
* Canary rollout to internal team → 10 % users → 50 % → 100 %.

---

## 10  Roadmap & Future Innovations  

| Idea | Pay‑off |
|------|---------|
| **AI‑assisted Layout** (OpenAI) | Suggest optimal node spacing for readability |
| **Live Co‑editing** | Real‑time updates via WebSockets; mirrors Miro’s own cursors |
| **Micro‑frontend Plugins** | Parallel teams ship isolated features under `src/plugins` |
| **Serverless Validation** | AWS Lambda validates graph schema at import |
| **Edge Caching** | Cloudflare Worker caches layout results |

---

## 11  Coding Conventions (Appendix)  

* File naming: `PascalCase.tsx` for React, `kebab-case.ts` for utilities.  
* Imports ordered: std‑lib → vendor → local, alphabetic inside groups.  
* Tests co‑located: `Foo.ts` + `Foo.test.ts`.  
* Commit lint (conventional‑commits) enforced at CI.  
* ESLint custom rule bans `grid-column` in raw CSS.

---

_Maintain this guide as living documentation; update with each major commit or design‑system release._  
