# Development Guidelines

> **Context**
> The codebase began as a Node-based service but now centers on a **FastAPI (Python 3.11) backend** with a **React (TypeScript) frontend**. Legacy **.NET** components remain only for reference; see [legacy/dotnet/AGENTS.md](legacy/dotnet/AGENTS.md) for their guidelines. All new work follows the patterns, conventions, and tooling described below.

## Project Structure

``` bash
fenrick.miro.[module]/
├── src/      – implementation code
└── tests/    – unit and integration tests
```

Backend code is primarily **Python 3.11 (FastAPI)**. Archived **.NET** components live under `legacy/dotnet/` and follow [legacy/dotnet/AGENTS.md](legacy/dotnet/AGENTS.md). Frontend code is **TypeScript + React**.

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

### Python

* **Ruff** – lint and fix PEP 8 issues
* **Black** – code formatter (line length 88)
* **Mypy** – static type checking

### Frontend

* ESLint (typescript-eslint)

* Stylelint

* Prettier

## Development Commands

### Python

``` bash
poetry install
poetry run pre-commit run --files [changed files]
poetry run pytest
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

Archived **.NET** components have their own guidelines and commands; see [legacy/dotnet/AGENTS.md](legacy/dotnet/AGENTS.md).

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

* `docs/ARCHITECTURE.md` – layering, complexity, analyzers

* `docs/DEPLOYMENT.md` – build & CI/CD

* `CONTRIBUTING.md` – PR workflow, onboarding
* `docs/python-architecture.md` – FastAPI modules and data flow
* `legacy/dotnet/AGENTS.md` – archived C# guidelines

## Summary

| Area      | Requirement                                  |
| --------- | -------------------------------------------- |
| Structure | `src/` and `tests/` folders                  |
| Language  | Python (FastAPI) + React (TypeScript); archived .NET |
| Design    | SOLID, composition over inheritance          |
| Testing   | TDD, ≥ 90 % coverage                         |
| Analysis  | Ruff, Black, Mypy; ESLint; Stylelint |
| Commits   | Conventional Commits                         |
| Build     | Typed, documented, formatted, analyzer-clean |
