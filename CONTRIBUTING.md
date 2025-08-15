# Contributing to Miro JSON Graph Diagram App

We welcome pull requests and issues. Please read [Miro's contributing guide](https://github.com/miroapp/app-examples/blob/main/CONTRIBUTING.md) for the general workflow.

## Development

### Node

Run the web client checks:

```bash
npm install
npm --prefix web/client run typecheck
npm --prefix web/client run lint
npm --prefix web/client run stylelint
npm --prefix web/client run prettier
npm --prefix web/client run test
```

### Python

Install dependencies and validate changes:

```bash
poetry install
poetry run pre-commit run --files <changed files>
poetry run pytest
```

Aim for at least **90 % line and branch coverage** and keep cyclomatic complexity below eight as described in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Commit messages

Verify that your commit message follows the Conventional Commits format. A `commit-msg` hook runs commitlint automatically, but you can also check the latest commit manually by running:

```bash
npm run commitlint -- --edit $(git rev-parse --verify HEAD)
```

## Pre-commit checks

Run the validation commands listed above before committing any changes. Husky's `pre-commit` hook runs only the lint and formatting steps so commits stay quick. Execute the tests manually before committing to catch regressions.
