# Development Notes

Each project resides in its own `fenrick.miro.*` folder containing `src/` and
`tests/` subdirectories. Place code under `src/` and tests under `tests/`.

Before committing changes run `npm install` to ensure dependencies are up to
date and then:

```bash
npm run typecheck --silent
npm test --silent
npm run lint --silent
npm run stylelint --silent
npm run prettier --silent
```

A Husky pre-commit hook runs these commands automatically when creating a
commit. Run `npx husky install` once after cloning to activate the hooks. The
hook no longer modifies dependencies.

These commands run **ESLint**, **Stylelint** and **Prettier** to ensure a
consistent codebase.

Commit messages **must** follow the
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format.
Use `type(scope): summary` with types such as `feat`, `fix`, `docs` or `chore`
so tools like semantic-release can parse the history correctly.

Refer to [docs/CODE_STYLE.md](docs/CODE_STYLE.md) for formatting and naming
guidelines. Exported functions and complex logic should include documentation
comments to aid readability. See [CONTRIBUTING.md](CONTRIBUTING.md) for the
workflow and a link to the developer tutorial. Build and deployment steps are
documented in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Per [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) §6, maintain **90 % line and
branch coverage** and keep **cyclomatic complexity ≤ 8**. New or updated
features must include unit tests and documentation comments.
