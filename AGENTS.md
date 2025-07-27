# Development Notes

Each project resides in its own `fenrick.miro.*` folder containing `src/` and
`tests/` subdirectories. Place code under `src/` and tests under `tests/`.

All code **must** follow a rigorous test-driven development workflow. Seed new
features with granular TODO comments, write failing tests for each task, then
implement only the logic required to make the tests pass. Refactor once tests
are green. Keep functions focused on a single task and ensure cyclomatic
complexity stays below eight. Aim for 90 % or higher coverage across modules,
functions, branches and lines. Use descriptive names and add documentation
comments outlining the purpose, inputs, outputs, side-effects and possible
exceptions of every public element.

Before committing changes run `npm install` to ensure dependencies are up to
date and then run the full suite of checks:

```bash
npm --prefix fenrick.miro.client run typecheck
npm --prefix fenrick.miro.client run test
npm --prefix fenrick.miro.client run lint
npm --prefix fenrick.miro.client run stylelint
npm --prefix fenrick.miro.client run prettier
dotnet format fenrick.miro.slnx
dotnet restore fenrick.miro.slnx
dotnet test fenrick.miro.slnx
```

The `.husky/` folder stores Git hooks. Run `npx husky install` once after
cloning to activate them. The `pre-commit` hook runs the lint and formatting
commands above but intentionally skips the test suite so commits remain fast.
Run the tests yourself before committing to ensure nothing breaks.

These commands run **ESLint**, **Stylelint** and **Prettier** to enforce
formatting and lint rules. The Node and .NET test suites must cover both
positive and negative branches along with user interaction paths.

Commit messages **must** follow the
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format.
Use `type(scope): summary` with types such as `feat`, `fix`, `docs` or `chore`
so tools like semantic-release can parse the history correctly.

Refer to [docs/CODE_STYLE.md](docs/CODE_STYLE.md) for formatting and naming
guidelines. Exported functions and complex logic should include documentation
comments. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and a link to
the developer tutorial. Build and deployment steps are documented in
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Per [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) §6, maintain **90 % line and
branch coverage** and keep **cyclomatic complexity ≤ 8**. New or updated
features must include unit tests and documentation comments. Code should be
fully typed, formatted and secure with no code smells or lint warnings.
