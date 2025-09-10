# Development Guidelines

> Context
> The backend is migrating to a Node.js service that uses the official Miro Node.js API client, with a React (TypeScript) frontend. Python FastAPI components are being decommissioned and treated as legacy during the transition. Legacy **.NET** components remain only for reference; see [legacy/dotnet/AGENTS.md](legacy/dotnet/AGENTS.md).

For the detailed design of the new Node backend, see:

- docs/node-architecture.md – Node backend architecture and Miro integration
- docs/migration-node-plan.md – step-by-step plan to remove Python and implement Node backend

## Project Structure

``` bash
fenrick.miro.[module]/
├── src/      – implementation code
└── tests/    – unit and integration tests
```

Backend code is **Node.js + TypeScript (Fastify)**. The Python FastAPI backend is legacy and will be removed after migration. Archived **.NET** components live under `legacy/dotnet/`. Frontend code is **TypeScript + React**.

## Object-Oriented Design Principles — **Mandatory**

Well-formed OO design maximises reuse, clarity, and long-term changeability.

| Principle                 | Practical Expectation                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Single Responsibility** | Keep each class focused; cyclomatic complexity ≤ 8.                                                          |
| **Open/Closed**           | Design for extension via interfaces, abstract classes, and independ­ent modules. Avoid editing shipped code. |
| **Liskov Substitution**   | Subtypes must honour base contracts; no “surprise” behaviour.                                                |
| **Interface Segregation** | Favour small, purpose-built interfaces.                                                                      |
| **Dependency Inversion**  | Depend on abstractions; wire concrete types through **DI** (Aspire host or `IServiceCollection`).            |

Additional OO practices

* **Composition over inheritance** unless a true “is-a” relationship exists.

* **Domain-Driven Design language** in aggregates and value objects.

* **Generic abstractions** where they cut duplication and remain obvious.

* **Immutability** for value types and DTOs—simplifies reasoning and testing.

* **Encapsulation:** expose the minimal public surface; keep internals private or `internal`.

## Workflow Expectations

### Test-Driven Development (TDD)

1. Sketch todos.

2. Write a failing test.

3. Implement the smallest fix.

4. Refactor when tests pass.

### Quality Gates

| Metric        | Target                                 |
| ------------- | -------------------------------------- |
| Coverage      | ≥ 90 % lines & branches                |
| Complexity    | Cyclomatic complexity ≤ 8              |
| OO Compliance | Follows SOLID, composition first       |
| Documentation | XML/TS comments on every public symbol |
| Lint/Format   | Zero warnings or smells                |
| Build         | All analyzers pass; warnings as errors |

## Static Analysis

### Backend (Node)

* ESLint (typescript-eslint) – strict rules; no unused/any
* TypeScript (`tsc --noEmit`) – strict type checking
* Prettier – formatting

### Frontend

* ESLint (typescript-eslint)
* Stylelint
* Prettier

## Development Commands

### Backend (Node)

``` bash
npm --prefix server install
npm --prefix server run typecheck
npm --prefix server run lint
npm --prefix server run test
```

### Frontend

``` bash
npm install
npm --prefix web/client run typecheck
npm --prefix web/client run lint
npm --prefix web/client run stylelint
npm --prefix web/client run prettier
npm --prefix web/client run test
```

Archived **.NET** components have their own guidelines and commands; see [legacy/dotnet/AGENTS.md](legacy/dotnet/AGENTS.md). Python FastAPI docs remain available during migration (see docs/python-architecture.md) but are deprecated.

## Git Hooks

Git hooks live in `.husky/`.

``` bash
npx husky install
```

`pre-commit` runs formatters and linters. Run tests locally before committing.

## Commit Convention

Follow **Conventional Commits**:

``` bash
type(scope): short description
```

Types include `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.

## Reference Documents

* `docs/CODE_STYLE.md` – naming, formatting

* `docs/ARCHITECTURE.md` – layering, complexity, analyzers (historical overview)
* `docs/node-architecture.md` – Node backend architecture and data flow (authoritative)
* `docs/migration-node-plan.md` – migration steps from Python to Node

* `docs/DEPLOYMENT.md` – build & CI/CD

* `CONTRIBUTING.md` – PR workflow, onboarding
* `docs/python-architecture.md` – FastAPI modules and data flow (legacy)
* `legacy/dotnet/AGENTS.md` – archived C# guidelines

## Summary

| Area      | Requirement                                  |
| --------- | -------------------------------------------- |
| Structure | `src/` and `tests/` folders                  |
| Language  | Node.js (Fastify) + React (TypeScript); archived .NET |
| Design    | SOLID, composition over inheritance          |
| Testing   | TDD, ≥ 90 % coverage                         |
| Analysis  | ESLint/TS (backend & frontend); Stylelint |
| Commits   | Conventional Commits                         |
| Build     | Typed, documented, formatted, analyzer-clean |
