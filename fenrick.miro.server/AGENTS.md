# .NET Guidelines

Target **.NET 9**. Source files live under `src/`. Unit tests are in `fenrick.miro.tests`. Before committing run:

```bash
dotnet restore
dotnet test fenrick.miro.tests/fenrick.miro.tests.csproj -v minimal
```

Keep coverage above 90% and cyclomatic complexity under 8 as stated in the repository root guidelines. Document public members and any non-trivial logic.
