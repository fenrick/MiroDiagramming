# Development Notes

All source files live in `src/**` with accompanying tests in `tests/**`.

Before committing changes run:

```
npm run typecheck --silent
npm test --silent
```

Exported functions and complex logic should include documentation comments to
aid readability.
