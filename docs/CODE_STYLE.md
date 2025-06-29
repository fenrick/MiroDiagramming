# Code Style Guide

This project enforces consistent formatting with
[Prettier](https://prettier.io/) and lint rules via
[ESLint](https://eslint.org/).

## Formatting

- Two space indentation and LF line endings are defined in
  [.editorconfig](../.editorconfig).
- Prettier configuration lives in [.prettierrc](../.prettierrc) and formats all
  source files. Run `npm run prettier --silent` before committing.
- The `printWidth` is 80 characters; lines should wrap accordingly.
- Semicolons are required and single quotes are preferred for strings.

## Naming

- Files containing React components use `PascalCase.tsx`.
- Utility modules use `kebab-case.ts`.
- Variables and functions are `camelCase`; types and components use
  `PascalCase`.

## Conventions

- Keep functions focused on a single task and maintain cyclomatic complexity
  under eight.
- Document exported functions with TSDoc comments.
- Import order follows standard → vendor → local, alphabetically within each
  group.

## Lint guidelines

- Mark class fields that are assigned only in the constructor as `readonly`.
- Use optional chaining when accessing nested properties.
- Avoid non-null assertions (`!`) and redundant casts; refine types instead.
- Prefer semantic HTML tags like `<fieldset>` or `<details>` over generic `div`
  elements with ARIA roles.
- Avoid using array indexes as React list keys; use stable identifiers instead.
- Event handlers should not return Promises; use `void` to fire-and-forget.

For additional architectural guidelines see [ARCHITECTURE.md](ARCHITECTURE.md).
