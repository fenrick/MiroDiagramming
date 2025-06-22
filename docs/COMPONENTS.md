# Component & Implementation Guide  
_Actionable usage cookbook for `mirotone-react` in Miro Web-SDK add-ons (June 2025)_

---

## 1  Purpose  
Provide designers and developers with **code-level guidance**, sample patterns, and enforcement checks to ship UIs that conform to the Design System Foundation.

---

## 2  Installation & Bootstrapping  

```bash
npm install mirotone mirotone-react
````

```ts
// app entry
import 'mirotone/dist/styles.css';   // Import ONCE
```

* Ensure no duplicate CSS imports (check bundle analysis).
* Enforce React 18+ and TypeScript strict mode.

---

## 3  Component Catalogue

| Component  | Key props / Options             | Variants         | Default h  |       |          |
| ---------- | ------------------------------- | ---------------- | ---------- | ----- | -------- |
| `Button`   | \`variant="primary              | secondary        | danger"\`  | 3     | 32 px    |
| `Input`    | \`size="medium                  | small"` `error\` | –          | 32 px |          |
| `Checkbox` | —                               | –                | 16 px      |       |          |
| `Modal`    | `isOpen`, `onClose`, \`size="sm | md               | lg"\`      | 3     | Adaptive |
| `Grid`     | \`as="section                   | div"\`           | –          | Fluid |          |
| `Stack`    | `space="xs…xl"` `align`         | –                | Vertical   |       |          |
| `Cluster`  | `gap="xs…xl"` `wrap`            | –                | Horizontal |       |          |

Focus-ring thickness: **2 px**; colour: `tokens.color.blue[500]`.

---

## 4  Layout Components

### 4.1  Grid Usage

```tsx
<Grid>
  <Sidebar cs={1} ce={4} lgCs={1} lgCe={3} />
  <Main    cs={4} ce={13} />
</Grid>
```

* `cs` / `ce` accept **1-13** (inclusive).
* Use `lgCs`, `mdCs`, etc. for breakpoint-specific spans.
* No inline `grid-column` CSS.

### 4.2  Stack & Cluster

```tsx
<Stack space="md">
  <Input label="Name" />
  <Button variant="primary">Submit</Button>
</Stack>

<Cluster gap="sm" wrap="wrap" justify="start">
  {tags.map(t => <Tag key={t}>{t}</Tag>)}
</Cluster>
```

`space` / `gap` map directly to spacing tokens.

### 4.3  Placement Helpers

| Utility          | Effect                                   |
| ---------------- | ---------------------------------------- |
| `.centered`      | Absolute centring (flex)                 |
| `.stretch`       | `align-self: stretch`                    |
| `.sticky-bottom` | Stick to bottom edge of scroll container |

---

## 5  Validation & Accessibility

* **Labels:** always supply `label` prop on inputs.
* **Errors:** pass a string to `error`—invalid state automates `aria-invalid`.
* **Keyboard:** `<Tab>` order must match visual order; validate via browser devtools.
* **ARIA Extensions:** apply only for custom composite widgets—follow WAI-ARIA Authoring Practices.

---

## 6  Sample Pattern — Modal Form

```tsx
import { Modal, Stack, Title, Input, Button, Cluster } from 'mirotone-react';

export function RenameBoardModal({ isOpen, close }) {
  const [name, setName] = useState('');
  const error = !name.trim() && 'Required';

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <Stack space="md" style={{ width: 320 }}>
        <Title level={3}>Rename board</Title>

        <Input
          label="New name"
          value={name}
          required
          error={error}
          onChange={(e) => setName(e.target.value)}
        />

        <Cluster gap="sm" justify="end">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button variant="primary" disabled={!!error}>Save</Button>
        </Cluster>
      </Stack>
    </Modal>
  );
}
```

*Zero custom CSS; responsive & WCAG-AA compliant out of the box.*

---

## 7  Quality Gates

```bash
npm run typecheck --silent   # TypeScript strict
npm test --silent            # Vitest / Jest
npm run lint --silent        # ESLint + Stylelint
npm run prettier --silent    # Prettier
```

Integrate as a pre-commit hook and CI step; block merges on failure.

### 7.1  ESLint Guard

```js
"rules": {
  "no-restricted-syntax": [
    "error",
    {
      "selector": "Literal[value=/grid-column/]",
      "message": "Use Grid props (cs/ce) instead of raw grid-column."
    }
  ]
}
```

---

## 8  Further Reading

* `README.md` – project setup
* `docs/design_system_foundation.md` – this repo
* WCAG 2.2 quick-ref – contrast & focus guidelines
* Miro Web-SDK docs – board API & add-ons

*Last reviewed: 22 June 2025*
