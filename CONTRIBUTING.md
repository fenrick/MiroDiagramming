# Contributing to Miro JSON Graph Diagram App

We welcome pull requests and issues. Please read [Miro's contributing guide](https://github.com/miroapp/app-examples/blob/main/CONTRIBUTING.md) for the general workflow.

## Development

### Node

Run the type checks, linters and tests:

```bash
pnpm install
pnpm run typecheck
pnpm run lint
pnpm run format
pnpm test
```

## Commit messages

Verify that your commit message follows the Conventional Commits format. A `commit-msg` hook runs commitlint automatically, but you can also check the latest commit manually by running:

```bash
pnpm run commitlint -- --edit $(git rev-parse --verify HEAD)
```

## Pre-commit checks

Run the validation commands listed above before committing any changes. Husky's `pre-commit` hook runs only the lint and formatting steps so commits stay quick. Execute the tests manually before committing to catch regressions.
