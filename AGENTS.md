# Development Notes

All source files live in `src/**` with accompanying tests in `tests/**`.

Before committing changes run `npm install` to ensure dependencies are up to
date and then:

```
npm run typecheck --silent
npm test --silent
npm run lint --silent
npm run prettier --silent
```

Refer to [docs/CODE_STYLE.md](docs/CODE_STYLE.md) for formatting and naming
guidelines. Exported functions and complex logic should include documentation
comments to aid readability. See [CONTRIBUTING.md](CONTRIBUTING.md) for the
workflow and a link to the developer tutorial. Build and deployment steps are
documented in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Per [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) §6, maintain **90 % line and
branch coverage** and keep **cyclomatic complexity ≤ 8**. New or updated
features must include unit tests and documentation comments.
