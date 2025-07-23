# Node Guidelines

Use **Node 20 LTS**. The `.nvmrc` file pins this version; use a version manager like `nvm` or `volta` to match it. After cloning run `npx husky install` once to activate Git hooks.

Before committing from this folder run:

```bash
npm install
npm run typecheck --silent
npm run test --silent
npm run lint --silent
npm run stylelint --silent
npm run prettier --silent
```

Follow the coverage and complexity budgets defined in the repository root.
