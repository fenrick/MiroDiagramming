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

Exported functions and complex logic should include documentation comments to
aid readability.
