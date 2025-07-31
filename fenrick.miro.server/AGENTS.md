# .NET Guidelines

Target **.NET 9**. Source files live under `src/`. Unit tests are in
`fenrick.miro.tests`. Before committing run:

```bash
dotnet restore
dotnet format
dotnet test fenrick.miro.tests/fenrick.miro.tests.csproj -v minimal
```

Develop using rigorous TDD. Begin with small TODO notes, write failing unit
tests for each behaviour and implement only the minimal code to pass. Refactor
with tests green. Structure classes and methods to maintain single
responsibility with cyclomatic complexity below eight.

Enable nullable reference types and treat warnings as errors. Follow the code
style defined in `.editorconfig` and use `dotnet format` to keep the codebase
consistent. Public members and any non-trivial logic must be documented with XML
comments detailing purpose, inputs, outputs, side effects and thrown exceptions.
Use descriptive names and secure coding practices to avoid common
vulnerabilities.

Tests must cover positive and negative paths and any user-facing behaviour.
Maintain at least 90 % coverage and follow the complexity budget defined in the
repository root.
