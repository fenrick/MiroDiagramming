# Styling and Formatting Guide  
_Standards for UI consistency and developer workflow in Miro Web SDK add‑ons using **mirotone‑react**_

---

## Purpose

This guide provides explicit rules for building Miro add‑ons that look, feel, and behave like native Miro.  
It positions **`mirotone-react`** as the single source of truth for design tokens, components, and layout patterns, eliminating ad‑hoc styling and ensuring WCAG‑AA–compliant, accessible experiences.

---

## 1  Core Principle — Use `mirotone‑react`

`mirotone-react` wraps Mirotone CSS in type‑safe React components. All new UI **must** be constructed with this library unless a documented exception is approved by Design Engineering.

### Installation & Bootstrapping

```bash
npm install mirotone mirotone-react
```

```ts
// ✅ Import the global Mirotone stylesheet once, as early as possible
import 'mirotone/dist/styles.css';
```

---

## 2  UI Construction with Components

| Component                | Use‑case                               |
| ------------------------ | -------------------------------------- |
| `Button`                 | Primary & secondary actions            |
| `Input` / `Textarea`     | Text fields with validation            |
| `Checkbox` / `Radio`     | Boolean & single‑choice selections     |
| `Link`                   | Inline navigation                      |
| `Tooltip`                | Contextual help                        |
| `Modal`                  | Focus‑trapping dialogs                 |
| `Stack` / `Cluster`      | Vertical & horizontal spacing utility  |
| `Grid`                   | Responsive, column‑based layouts       |
| `Title` / `Text`         | Semantic, accessible typography        |

### Example

```tsx
import { Button, Input, Stack } from 'mirotone-react';

<Stack space="md">
  <Input
    label="Board name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
    error={showError ? 'Name is required' : ''}
  />
  <Button variant="primary" onClick={handleSubmit}>
    Create
  </Button>
</Stack>
```

---

## 3  Layout & Spacing

- **Never** hard‑code pixel values.  
- Use `Stack`, `Cluster`, or `Grid` components rather than raw utility classes.  
- Set spacing via the `space` prop (`xs`, `sm`, `md`, `lg`, `xl`) which maps to `tokens.space.*` values from Mirotone.

```tsx
<Stack space="lg">
  <Title level={2}>Project Settings</Title>
  <Input label="Project name" />
</Stack>
```

---

## 4  Typography

Use the dedicated typography components. Avoid raw `<h1>`/`<p>` or inline CSS.

```tsx
import { Title, Text } from 'mirotone-react';

<Title level={3}>Workspace details</Title>
<Text variant="body">
  This description is visible to all collaborators.
</Text>
```

---

## 5  Validation & Accessibility

All `mirotone-react` inputs expose:

* `label` and `required` props for semantics  
* `error` prop for inline validation messages  
* Automatic `aria-*` wiring

Ensure:

1. Labels are always present.  
2. Contrast ratios meet or exceed 4.5:1.  
3. Keyboard interaction is fully supported.  

---

## 6  Minimal‑CSS Policy

Custom styles are discouraged. If absolutely necessary:

1. Scope locally with CSS Modules or Emotion.  
2. Prefix with `custom-`.  
3. Document the reason and link to design‑review ticket.

```css
/* styles.module.css */
.custom-tooltip-container {
  max-width: 280px;
}
```

```tsx
<div className={styles['custom-tooltip-container']}>
  <Tooltip content="More info" />
</div>
```

---

## 7  Theming & Dark Mode

`mirotone-react` inherits the active Miro theme.  
Do not override colours, backgrounds, or shadows.  
Test in both light and dark environments using Miro’s preview switcher.

---

## 8  Code Quality Gates

Before every commit run:

```bash
npm run typecheck --silent   # TypeScript
npm test --silent            # Unit tests
npm run lint --silent        # ESLint & Stylelint
npm run prettier --silent    # Prettier
```

Automate these checks in CI.

---

## 9  Composition Patterns

> **Prefer composition over custom wrappers.**

```tsx
<Stack space="md">
  <Title level={2}>New board</Title>
  <Input label="Name" value={name} />
  <Button variant="primary">Create</Button>
</Stack>
```

---

## 10  Further Reading

* **Mirotone Design System** – <https://developers.miro.com/docs/design-guidelines>  
* **mirotone‑react docs** – <https://github.com/andrewvo89/mirotone-react>  
* **WCAG 2.1 Contrast** – <https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html>  
* **Prettier** – <https://prettier.io/>  
* **ESLint** – <https://eslint.org/>  
* **Stylelint** – <https://stylelint.io/>  
* **Miro Accessibility** – <https://help.miro.com/hc/en-us/sections/4408885084818-Accessibility-in-Miro>  