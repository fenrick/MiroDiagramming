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
- Avoid boolean selector parameters. Use separate functions or enums to
  communicate intent.

## Lint guidelines

- Mark class fields that are assigned only in the constructor as `readonly`.
- Use optional chaining when accessing nested properties.
- Avoid non-null assertions (`!`) and redundant casts; refine types instead.
- Steer clear of nested ternary expressions. Prefer `if`/`else` blocks or helper
  functions for clarity.
- Prefer semantic HTML tags like `<fieldset>` or `<details>` over generic `div`
  elements with ARIA roles.
- Avoid using array indexes as React list keys; use stable identifiers instead.
- Event handlers should not return Promises; use `void` to fire-and-forget.

For additional architectural guidelines see [ARCHITECTURE.md](ARCHITECTURE.md).

## Python

Backend scripts and services follow [PEP 8](https://peps.python.org/pep-0008/) and are formatted with [Black](https://black.readthedocs.io/en/stable/) using an 88 character line length. Lint with [Ruff](https://docs.astral.sh/ruff/) and type-check with [Mypy](https://mypy.readthedocs.io/). Document public APIs with concise docstrings and keep type hints on all function signatures. Run `poetry run pre-commit run --files <files>` before committing.

## Storybook

Run the Storybook dev server during component development to preview UI changes.
Execute:

```bash
npm run storybook
```

This command launches Storybook on `http://localhost:6006`. Generate a static
version with:

```bash
npm run build-storybook
```

The CI workflows under `.github/workflows/` also build Storybook during pull
requests. `client-prettier.yml` and related files keep the UI consistent before
merging.
