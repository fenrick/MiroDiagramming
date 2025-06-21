# Styling and Formatting

This guide describes how to apply styles using Mirotone and how to keep the code
base consistent.

## Mirotone CSS

The application imports `mirotone/dist/styles.css` which provides the base
styles used across Miro products. To maintain a consistent look:

- Use the predefined utility classes such as `button`, `button-primary`, `cs*`
  and `ce*` for grid positioning.
- Avoid writing custom CSS when a Mirotone class exists for the same purpose.
- Keep layout spacing based on the sizing scale provided by `mirotone-react` via
  `tokens.space.*`.
- Components from `mirotone-react` already apply the correct Mirotone classes so
  prefer them over raw HTML elements.

## Using mirotone-react

`mirotone-react` supplies React wrappers for common controls like `Button`,
`Input`, `Checkbox` and more. Import these components instead of hand‑rolling
DOM elements. They expose props that map directly to Mirotone classes, ensuring
the markup follows the design system.

```tsx
import { Button, Checkbox, Input } from 'mirotone-react';
```

## Formatting

All code is formatted with Prettier. Before committing run the following
commands:

```bash
npm run typecheck --silent
npm test --silent
npm run lint --silent
npm run prettier --silent
```

This keeps the style consistent and catches common issues early.
