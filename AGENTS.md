# Development Guidelines

> **Context**
> The codebase began as a Node-based service but now targets a full-stack **.NET Aspire backend** with a **React (TypeScript) frontend**. All new work follows the patterns, conventions, and tooling described below.

## Project Structure

``` bash
fenrick.miro.[module]/
├── src/      – implementation code
└── tests/    – unit and integration tests
```

Backend code is **C# (nullable enabled)**. Frontend code is **TypeScript + React**.

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

> _Tip_: Use **Roslynator** and **Meziantou.Analyzer** design‐rules to spot violations early.

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

### .NET (Roslyn)

* **Microsoft.CodeAnalysis.NetAnalyzers** – core rules

* **AsyncFixer, ConfigureAwaitChecker** – safe async

* **Meziantou.Analyzer** – allocation, struct, immutability

* **Roslynator** – design and readability helpers

All rules are configured in `.editorconfig`; the build runs with `-warnaserror`.

### Frontend

* ESLint (typescript-eslint)

* Stylelint

* Prettier

## Development Commands

### Backend

``` bash
dotnet restore fenrick.miro.slnx
dotnet format fenrick.miro.slnx
dotnet build fenrick.miro.slnx -warnaserror
dotnet test  fenrick.miro.slnx
```

### Frontend

``` bash
npm install
npm --prefix fenrick.miro.client run typecheck
npm --prefix fenrick.miro.client run lint
npm --prefix fenrick.miro.client run stylelint
npm --prefix fenrick.miro.client run prettier
npm --prefix fenrick.miro.client run test
```

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

## Summary

| Area      | Requirement                                  |
| --------- | -------------------------------------------- |
| Structure | `src/` and `tests/` folders                  |
| Language  | C# (.NET Aspire) + React (TypeScript)        |
| Design    | SOLID, composition over inheritance          |
| Testing   | TDD, ≥ 90 % coverage                         |
| Analysis  | Roslyn analyzers, ESLint, Stylelint          |
| Commits   | Conventional Commits                         |
| Build     | Typed, documented, formatted, analyzer-clean |
