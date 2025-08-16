# Archived .NET Guidelines

These components are retained for historical reference. When modifying them:

* Target **.NET 9** and enable nullable reference types.
* Place source files under `src/` and tests under `fenrick.miro.tests`.
* Run `dotnet format` and `dotnet test` before committing.
* Follow the repository `.editorconfig` and document public APIs with XML comments.

For module-specific rules, see subdirectory files such as [fenrick.miro.server/AGENTS.md](fenrick.miro.server/AGENTS.md).
