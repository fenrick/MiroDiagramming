# Contributing to Miro JSON Graph Diagram App

We welcome pull requests and issues. Please read
[Miro's contributing guide](https://github.com/miroapp/app-examples/blob/main/CONTRIBUTING.md)
for the general workflow.

## Developer Tutorial

See the
[Miro developer documentation](https://developers.miro.com/docs/overview) for a
step-by-step tutorial on building diagramming apps. When contributing code,
please follow the formatting rules in [docs/CODE_STYLE.md](docs/CODE_STYLE.md)
and the Python conventions outlined in
[docs/python-architecture.md](docs/python-architecture.md). Use `poetry run
pre-commit run --files …` and `poetry run pytest` for Python changes. Aim for at
least **90 % line and branch test coverage** in Node, .NET and Python code and
keep cyclomatic complexity below eight as described in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Commit messages

Verify that your commit message follows the Conventional Commits format. A
`commit-msg` hook runs commitlint automatically, but you can also check the
latest commit manually by running:

```bash
npm run commitlint -- --edit $(git rev-parse --verify HEAD)
```

Our CI also checks commit messages in
[`\.github/workflows/commitlint.yml`](.github/workflows/commitlint.yml).

## Pre-commit checks

Run the validation commands listed in [AGENTS.md](AGENTS.md) before committing
any changes. They lint, format and test both the Node and .NET codebases.
Husky's `pre-commit` hook under `.husky/pre-commit` runs only the lint and
formatting steps so commits stay quick. Execute the tests manually before
committing to catch regressions.
