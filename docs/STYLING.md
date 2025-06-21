# Styling, Layout & Formatting Guide  
_Single‑source standards for building Miro Web‑SDK add‑ons with **mirotone-react** (June 2025)_

---

## Purpose  
This document gathers every design‑system rule—tokens, colours, typography, grid, spacing, accessibility, tooling—into **one definitive guide**.  
Use it during development; no external tabs required.

---

## 1  Core Principle — Library‑first, Token‑native  

1. **Build everything with `mirotone-react`**; avoid raw HTML + classes unless a documented gap exists.  
2. **Import Mirotone CSS once, globally**:

   ```ts
   import 'mirotone/dist/styles.css';
   ```

3. Access design tokens programmatically:

   ```ts
   import { tokens } from 'mirotone-react';
   const gap   = tokens.space.md;       // 24 px
   const brand = tokens.color.blue[500];  // #1A64F0
   ```

---

## 2  Installation & Bootstrapping

```bash
npm install mirotone mirotone-react
```

Add the global stylesheet in your app entry (e.g. `index.tsx`).  
Ensure **only one** import to prevent duplicate CSS.

---

## 3  Design Tokens (Complete)

### 3.1  Spacing Scale (`tokens.space.*`)

| Token | px | Typical use |
|-------|----|-------------|
| `xxxs` | 2 | Icon nudge |
| `xxs`  | 4 | Tight lists |
| `xs`   | 8 | Inline gaps |
| `sm`   | 16 | Item groups |
| `md`   | 24 | Form rows |
| `lg`   | 32 | Dialog padding |
| `xl`   | 40 | Card margins |
| `xxl`  | 48 | Page gutters |
| `xxxl` | 64 | Hero spaces |

### 3.2  Border‑radius Tokens

| Token | px |
|-------|----|
| `small`  | 2 |
| `medium` | 4 |
| `large`  | 8 |
| `xlarge` | 16 |
| `xxlarge`| 32 |
| `circle` | 50 % |

### 3.3  Colour Palette (excerpt)

```
tokens.color.blue[900]   #0D1B52
tokens.color.blue[500]   #1A64F0
tokens.color.green[800]  #0A6631
tokens.color.red[600]    #D7263D
tokens.color.yellow[400] #FFDB00
tokens.color.blackAlpha60 rgba(0,0,0,.6)
```

> **Rule:** reference tokens; never inline hex codes.

---

## 4  Typography

| Semantic  | Component / Class | Size | Weight |
|-----------|-------------------|------|--------|
| H1 | `<Title level={1}>` | 32 / 40 | 600 |
| H2 | `<Title level={2}>` | 24 / 32 | 600 |
| H3 | `<Title level={3}>` | 20 / 28 | 600 |
| H4 | `<Title level={4}>` | 16 / 24 | 600 |
| Body‑large | `<Text variant="large">` | 16 | 400 |
| Body‑medium| `<Text>` | 14 | 400 |
| Body‑small | `<Text variant="small">` | 12 | 400 |

> Never set font‑size / weight in CSS; rely on components.

---

## 5  Layout & Structure

### 5.1  12‑Column Fluid Grid (`<Grid>`)

| Breakpoint | Width | Columns | Gutter |
|------------|-------|---------|--------|
| **xs** | 0‑479 px | 4  | 8 px |
| **sm** | 480‑767 | 8  | 8 px |
| **md** | 768‑1023 | 12 | 16 px |
| **lg** | 1024‑1439 | 12 | 24 px |
| **xl** | ≥1440 | 12 | 32 px |

```tsx
<Grid>
  <Sidebar cs={1} ce={4} />
  <Main    cs={4} ce={13} />
</Grid>
```

Columns auto‑wrap below `md`, fulfilling WCAG 1.4.10 Reflow.

### 5.2  Stack (vertical) & Cluster (horizontal)

```tsx
<Stack space="lg">
  <Title level={2}>Settings</Title>
  <Input label="Board name" />
  <Button variant="primary">Save</Button>
</Stack>

<Cluster gap="sm" wrap="wrap" align="center">
  {tags.map(t => <Tag key={t}>{t}</Tag>)}
</Cluster>
```

Props map directly to the spacing/colour tokens.

### 5.3  Placement Helpers

| Utility / Prop | Purpose |
|----------------|---------|
| `.centered` | Absolute centring (flex) |
| `.stretch`  | Fill cross‑axis |
| `.sticky-bottom` | Stick to container bottom |

---

## 6  Component Catalogue & Variants

| Component | Key props | Default height | Focus style |
|-----------|-----------|----------------|-------------|
| `Button`  | `variant="primary|secondary|danger"` | 32 px | 2 px blue outline |
| `Input`   | `size="medium|small"` | 32 px | Visible caret |
| `Checkbox`| – | 16 px | Tick toggles via <kbd>Space</kbd> |
| `Modal`   | `isOpen`, `onClose` | Adaptive | Focus trap |

---

## 7  Validation & Accessibility (WCAG 2.2)

1. **Contrast** ≥ 4.5 : 1.  
2. **Reflow**: no horizontal scroll up to 400 % zoom.  
3. **Focus not obscured** (SC 2.4.11).  
4. Use `label`, `required`, `error` props for inputs; extend with valid `aria-*` only when needed.

---

## 8  Theming & Dark Mode

Mirotone tokens auto‑switch with the board’s theme.  
Do **not** override colours or backgrounds; test in both modes via Developer → Interface Theme.

---

## 9  Minimal‑CSS Policy

Custom CSS only if `mirotone-react` lacks capability:

* Scope with CSS Modules or Emotion.  
* Prefix classes `custom‑`.  
* Document Figma/Jira link at top of file.

---

## 10  Quality Gates

```bash
npm run typecheck --silent    # TypeScript strict
npm test --silent             # Unit tests
npm run lint --silent         # ESLint + Stylelint
npm run prettier --silent     # Formatting
```

Add these commands to CI; block merges on failure.

---

## 11  Sample Pattern – Modal Form

```tsx
import { Modal, Stack, Title, Input, Button, Cluster } from 'mirotone-react';

function RenameBoard({ isOpen, close, name, setName }) {
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
          onChange={e => setName(e.target.value)}
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

No custom CSS. Responsive, accessible, WCAG‑AA compliant out‑of‑box.

---

## 12  ESLint Guard (optional)

```js
"no-restricted-syntax": [
  "error",
  {
    selector: "Literal[value=/grid-column/]",
    message: "Use cs*/ce* props or classes instead of raw grid-column."
  }
]
```

---

## 13  Further Reading

* Mirotone CSS & tokens (embedded via import)  
* `mirotone-react` README & token docs  
* WCAG 2.2 – SC 1.4.10 Reflow, SC 2.4.11 Focus Not Obscured  
* Miro Web‑SDK reference & “Add Mirotone to existing app” tutorial  

_Update this guide whenever Mirotone or WCAG updates land._
