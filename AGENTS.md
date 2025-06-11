# Contribution Guide

This project uses **Node.js v22** and **Yarn v4**. The CI workflow enables Corepack and runs with these versions. Local development should match this setup.

## Commands

- `yarn prettier` – format all files using Prettier.
- `yarn prettier:check` – verify formatting.
- `yarn test` – run Jest unit tests.
- `yarn build` – create a production build.

## Coding Standards

- Place source files under `src/**` and accompanying tests under `tests/**`.
- Use descriptive variable names.
- Write documentation comments in [JSDoc/TSDoc](https://tsdoc.org/) style for exported functions, classes and complex logic.

## Commit Messages

- Start with a short imperative summary (<=72 characters).
- Use the body to explain **why** the change was made when necessary.

## Pull Request Checklist

Before opening a PR:

1. Run `yarn prettier` and `yarn prettier:check`.
2. Run `yarn test`.
3. Run `yarn build`.
4. Ensure new source files live in `src/**` with tests in `tests/**`.
5. Provide clear PR description of the change.
