# Miro Web-SDK Add-on — Architecture & Expansion Guide

_Version 2025-06-22_

---

## 0 Purpose

Authoritative blueprint for building, extending and operating the add-on.
Maintain as living documentation; update with every breaking,
security-significant or process change.

---

## 1 Document Map

| Topic                                           | Detailed source   |
| ----------------------------------------------- | ----------------- |
| Component APIs, props, patterns                 | **COMPONENTS.md** |
| Design tokens, colour, spacing, typography      | **FOUNDATION.md** |
| CI/CD, hosting, rollback, environment settings  | **DEPLOYMENT.md** |
| Sidebar tab flows, validation, keyboard support | **TABS.md**       |

---

## 2 System Overview

```
Browser
  └── UI Shell  ──► Miro Iframe
          ▲                 │
          │                 ▼
     Layout Engine ──► Board Adapter
          ▲                 │
          │                 ▼
        Graph Processor  ◄─ Data Sources (REST/CSV/Graph)
                         │
                         └─► Data store (Miro item ids)
```

The React GUI communicates with a **.NET 8** server for all Miro REST API calls.
OAuth tokens are obtained during browser login, then stored securely by the
server and retrieved for each request. The existing web API embedded in the GUI
continues to handle UX events and simple actions. The server also persists the
ids of created Miro items so they can be synchronised or referenced later.

```
React GUI ──► .NET 8 Server ──► Miro REST API
                   │
                   └─► Data store (Miro item ids)
```

---

## 3 Layering

```
Data        → Graph Normalisation → Layout Engine → Board Rendering → UI Orchestration
(src/core)     (src/core)            (src/core)      (src/board)       (src/ui)
```

- **Pure Core** (src/core) – framework-agnostic logic.
- **Board Adapter** (src/board) – converts domain objects to Miro widgets.
- **UI Shell** (src/ui) – React views built with design-system wrappers.
- **Infrastructure** (scripts, .github) – build, lint, test, release automation.

---

## 4 Repository Map

```
.net/         *.csproj and solution files
src/
  server/      Api/, Services/, Domain/
  ux/          app/, board/, core/, ui/
  core/        graph/, layout/, utils/
  board/       BoardBuilder, CardProcessor
  # Detailed per-file descriptions:
  # - [CORE_MODULES.md](CORE_MODULES.md)
  # - [BOARD_MODULES.md](BOARD_MODULES.md)
  # - [UI_MODULES.md](UI_MODULES.md)
  # - [APP_MODULES.md](APP_MODULES.md)
  # - [SERVER_MODULES.md](SERVER_MODULES.md)
  app/         entry + routing
tests/         server/, ux/
.storybook/    MDX docs & live examples
public/        icons, i18n JSON
scripts/       build helpers
docs/          *.md (this file, components, foundation …)
```

---

## 5 Core Modules & Complexity Budget

| Module         | Responsibility                        | Main surface      | Budget / function        |
| -------------- | ------------------------------------- | ----------------- | ------------------------ |
| GraphProcessor | Parse external data, attach ELK hints | load, metadata    | ≤ 70 lines, ≤ 8 branches |
| elk-layout.ts  | Run ELK layout inline                 | layout            | same                     |
| BoardBuilder   | Create / update widgets               | sync, remove      | same                     |
| CardProcessor  | Import cards, undo/redo               | importCards, undo | same                     |
| DiagramApp     | React root, routing, providers        | `<AppRouter>`     | same                     |

Complexity limits enforced automatically by **SonarQube** gate.

---

## 6 Quality, Testing & CI/CD

| Stage      | Gate                        | Threshold            |
| ---------- | --------------------------- | -------------------- |
| Pre-commit | ESLint, Stylelint, Prettier | zero errors          |
| Unit       | `npm test`, `dotnet test`   | ≥ 90 % line & branch |
| UI         | manual visual & a11y review | no critical issues   |
| Metrics    | SonarQube                   | cyclomatic ≤ 8       |

**Workflow** (GitHub Actions)

1. Restore Node and .NET dependencies from cache.
2. Lint, type-check and unit tests for both codebases (Node 24, .NET 9).
3. Build Storybook and a feature-flagged bundle for staging.
4. SonarQube analysis and budget checks (configured by
   [sonar-project.properties](../sonar-project.properties)).
5. Semantic-release creates Git tag, changelog and Chrome-Store zip.
6. Automatic rollback uses the previously published artefact (see
   **DEPLOYMENT.md** for details).

---

## 7 Automated Code Review & Enforcement

- Both the Node and .NET code must maintain ≥ 90 % coverage with cyclomatic
  complexity under eight.

- CI checks fail pull requests if complexity, coverage or lint targets fall
  short.
- **Conventional Commits** enforced by commit-lint.
- Every PR must pass all CI gates; manual reviewers are optional.
- **CodeQL** scan adds static-analysis findings to the check suite (job `codeql`
  in [.github/workflows/ci.yml](../.github/workflows/ci.yml)).

---

## 8 Security & Threat Model (summary)

| Asset         | Threat                           | Mitigation                                                                          |
| ------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| Board content | Malicious SVG / script injection | Deep schema validation, CSP sandbox in iframe                                       |
| Layout Worker | DOS via oversized graphs         | Node cap 5 000, timeout 5 s                                                         |
| Supply-chain  | Malicious dependency             | SLSA-compliant provenance, `npm audit` blocks build                                 |
| User data     | Privacy breach                   | No external storage; all data stays on Miro board                                   |
| OAuth tokens  | Leakage or misuse                | Tokens stored on the server in an encrypted data store; the GUI never persists them |

_Tokens are acquired via browser OAuth and forwarded to the .NET 9 server. The
server encrypts tokens at rest and attaches them to API requests._

---

## 9 Progressive Delivery & Feature-Flag Governance

- Flags managed in **LaunchDarkly**; ownership tag **Product** or
  **Engineering**.
- Expiry date mandatory; nightly CLI prunes stale flags to curb technical debt.
- Roll-out ladder: internal → 5 % → 25 % → 100 %, with error and performance
  dashboards in Datadog.

---

## 10 Extensibility

### 10.1 Add a New Widget Type

1. Extend **GraphProcessor** schema.
2. Provide default ELK options (see [LAYOUT_OPTIONS.md](LAYOUT_OPTIONS.md)).
3. Implement **BoardBuilder.createWidget**.
4. Register inverse command in **CardProcessor** for undo.
5. Add tests and a Storybook example.
6. Document API in **COMPONENTS.md** under “Widget Catalogue”.

### 10.2 Plugin Hooks

| Hook       | Timing                       | Typical use                         |
| ---------- | ---------------------------- | ----------------------------------- |
| beforeSync | just before writing to board | mutate graph, add analytics context |
| afterSync  | after widgets are placed     | custom telemetry                    |
| onError    | centralised error boundary   | fallback UI, Sentry capture         |

---

## 11 UI / UX Practices

- Only **Stack**, **Cluster**, **Grid** layout primitives – no raw flex/grid.
- State machines (XState) for multi-step flows.
- Colour, spacing, typography tokens come directly from Miro themes; no
  overrides (see **FOUNDATION.md**).
- Visual regress tests run against both Light and Dark themes provided by Miro.
- WCAG 2.2 AA: contrast ≥ 4 . 5 : 1; reflow at 400 %.
- Provide five-second friction-free undo after large imports.

---

## 12 Performance & Scalability

- Worker pool size = CPU cores − 1 (max 4).
- IndexedDB caches ELK layouts keyed by graph hash.
- Diff-sync on board updates – never full re-render.
- WebAssembly ELK optional behind feature flag.
- Telemetry (posthog-js) tracks layout duration and error rate; thresholds feed
  Sonar dashboards.

---

## 13 Observability & Monitoring

| Concern       | Tool         | Signal                          |
| ------------- | ------------ | ------------------------------- |
| JS errors     | Sentry       | Error rate, stack trace         |
| Performance   | Datadog RUM  | Layout time, FPS                |
| Feature flags | LaunchDarkly | Error delta versus baseline     |
| Client logs   | Serilog      | `HttpLogSink` posts `/api/logs` |
| Accessibility | manual QA    | Issues logged per build         |

Deployment, rollback and monitoring hooks are documented in **DEPLOYMENT.md**.

---

## 14 Roadmap (next 6 months)

| Idea                   | Value statement                              | Reference         |
| ---------------------- | -------------------------------------------- | ----------------- |
| AI-assisted Layout     | 30 % faster diagram creation                 | research spike Q3 |
| Live Co-editing        | Shared cursors for workshops                 | prototype Q4      |
| Micro-frontend Plugins | Teams deploy features independently          | RFC-002           |
| Serverless Validation  | Cuts client bundle by 15 %                   | POC branch        |
| Edge Caching           | First-paint layout < 200 ms for repeat users | infra epic        |

---

## 15 Appendix: Coding Conventions

See [CODE_STYLE.md](CODE_STYLE.md) for detailed style rules.

- File names: PascalCase.tsx for React, kebab-case.ts for util.
- Import order: std → vendor → local, alphabetical within group.
- No raw grid-column in style blocks (enforced by custom ESLint rule).
- PR template checklist: coverage, complexity, a11y, dark-mode snapshot.
