# Node Guidelines

Use **Node 20 LTS**. The `.nvmrc` file pins this version; use a version manager
like `nvm` or `volta` to match it. After cloning run `npx husky install` once to
activate Git hooks.

Source code resides under `src/` with unit tests in `tests/`. Develop features
using test-driven development. Start with TODO comments for the desired
behaviour, write failing tests, implement the minimum to pass and refactor only
when green. Functions must remain focused with complexity under eight.

Enable TypeScript `strict` mode and adhere to the lint rules in `.eslintrc` and
formatting in `.prettierrc`. Use descriptive `camelCase` names and avoid code
smells such as deeply nested conditionals. Document each function with TSDoc
comments describing purpose, parameters, returns, side effects and thrown
errors. Security-sensitive code must be reviewed and tested for both success and
failure paths.

Before committing from this folder run:

```bash
npm install
npm run typecheck --silent
npm run test --silent
npm run lint --silent
npm run stylelint --silent
npm run prettier --silent
```

Tests must cover positive and negative branches as well as core UX flows.
Maintain at least 90 % coverage across modules, functions, branches and lines.
Follow the complexity budgets defined in the repository root.
