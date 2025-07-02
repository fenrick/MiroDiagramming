# Miro Web-SDK Add-on – Component & Implementation Guide

---

## 0 Purpose

Practical, step-by-step reference for junior engineers who build the add-on UI.
Explains how to:

- Consume the **Mirotone CSS** design language. ([mirotone.xyz][1])
- Use the lightweight wrapper components under `src/ui/components`. Legacy shims
  live in `src/ui/components/legacy`.
- Meet the accessibility, performance and quality gates defined in
  **ARCHITECTURE.md** and **FOUNDATION.md**.

---

## 1 Installing the design system layers

| Layer               | Package            | Install command  | Notes                                                                        |
| ------------------- | ------------------ | ---------------- | ---------------------------------------------------------------------------- |
| Tokens & raw styles | **mirotone** (CSS) | `npm i mirotone` | Adds the `dist/styles.css` file and all utility classes. ([mirotone.xyz][1]) |

### 1.1 Bootstrap CSS once

Include the stylesheet exactly once—ideally in `src/app/index.tsx`:

```tsx
import 'mirotone/dist/styles.css';
```

---

## 2 Component catalogue

Only props that junior devs **must** supply are shown. Use the wrapper
components or compose manually with Mirotone CSS.

| Name           | Core props                      | Variants                  | Default height (px) |
| -------------- | ------------------------------- | ------------------------- | ------------------- |
| **Button**     | label, onClick, disabled, icon? | primary, secondary, ghost | 32                  |
| **InputField** | value, onChange                 | text, number              | 32                  |
| **Select**     | options, value, onChange        | single, multi             | 32                  |
| **Checkbox**   | checked, onChange               | —                         | 20                  |
| **Modal**      | title, isOpen, onClose          | small, medium             | auto                |
| _SidebarTab_   | id, icon, title                 | persistent, modal         | fill                |
| _TabBar_       | tabs, tab, onChange, size?      | regular, small            | 48                  |
| **Grid**       | gap, columns                    | responsive                | n/a                 |
| **Stack**      | gap, direction                  | vertical, horizontal      | n/a                 |
| **Cluster**    | gap, align                      | left, right, centre       | n/a                 |
| **TabGrid**    | columns, className?             | —                         | n/a                 |

The **TabBar** component now covers both sidebar and nested navigation. Pass the
current tab id via `tab` and handle selection with `onChange`. Use
`size='small'` for compact nested tab sets. Buttons accept an optional `icon`
prop. Set `iconPosition="end"` to place the icon after the children.

> **When a wrapper is missing**
>
> 1. Write semantic HTML (for example `<div class="grid grid-gap-8">`).
> 2. Apply the documented Mirotone CSS classes.
> 3. Encapsulate in a small local React component under `src/ui/components/` so
>    that future upgrades swap the implementation behind a stable API. Previous
>    wrappers remain available in `src/ui/components/legacy/`.

---

## 3 Layout primitives (no raw flex/grid)

### 3.1 Grid – repeat-auto layout

```tsx
<Grid
  columns='repeat(auto-fill, 240px)'
  gap='16'>
  {nodes.map((n) => (
    <Card
      node={n}
      key={n.id}
    />
  ))}
</Grid>
```

### 3.2 Stack – vertical forms

```tsx
<Stack
  gap='12'
  direction='vertical'>
  <InputField
    label='Title'
    value={title}
    onChange={setTitle}
  />
</Stack>
```

### 3.3 Cluster – right-aligned actions

```tsx
<Cluster
  gap='8'
  align='right'>
  <Button
    ghost
    onClick={cancel}>
    Cancel
  </Button>
  <Button
    primary
    onClick={save}>
    Save
  </Button>
</Cluster>
```

---

## 4 Sample pattern – Modal form with validation

```tsx
<Modal
  isOpen={show}
  title='Create card'
  onClose={close}>
  <form
    onSubmit={submit}
    noValidate>
    <Stack
      gap='12'
      direction='vertical'>
      <InputField
        label='Title'
        required
        placeholder='Title'
        value={title}
        onChange={setTitle}
      />
      <textarea
        className='textarea resize-auto'
        placeholder='Description'
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <Cluster
        gap='8'
        align='right'>
        <Button
          ghost
          onClick={close}>
          Cancel
        </Button>
        <Button
          primary
          type='submit'>
          Add
        </Button>
      </Cluster>
    </Stack>
  </form>
</Modal>
```

- First interactive control auto-focuses.
- `Esc` always triggers `onClose`.
- Browser validation bubbles up; error text appears via the **InputField**
  `invalid` state.

---

## 5 Accessibility quick-check

| Check                    | How to verify                                                             |
| ------------------------ | ------------------------------------------------------------------------- |
| Colour contrast ≥ 4.5:1  | Token palette already passes; confirm via **npm run a11y** headless test. |
| Tab order = visual order | Keyboard-walk the UI; make sure focus rings are visible.                  |
| Icon-only buttons        | Provide `aria-label` or `title`.                                          |
| Dialog semantics         | `role="dialog"` and `aria-modal="true"` on Modal root.                    |
| Headings                 | Ensure each heading has visible text content.                             |
| Labels                   | Never rely on placeholders alone – always render a `<label>` element.     |

Failing any item blocks the CI gate.

---

## 6 Styling rules & minimal-CSS policy

- Only Design-System tokens: colours, space, radii, typography (import via
  `tokens`).
- **No extra CSS classes** unless integrating a third-party lib.
- Inline `style={...}` is disallowed by ESLint rule `no-inline-style`.
- Dark-mode colours come free from Miro themes; test visually in both themes
  before merging. ([mirotone.xyz][1])

---

## 7 Performance notes

- Virtualise long lists with **react-window**.
- Debounce user typing (300 ms) before heavy graph searches.
- Wrap expensive renders in `React.memo` or split components.

---

## 8 Quality gates (automated in GitHub Actions)

| Stage             | Tool                     | Pass threshold          |
| ----------------- | ------------------------ | ----------------------- |
| Lint              | ESLint + Stylelint       | 0 errors                |
| Unit tests        | Vitest                   | ≥ 90 % lines & branches |
| Visual regression | manual screenshot review | no visual diffs         |
| Accessibility     | manual a11y review       | 0 critical              |

---

## 9 Further reading

- Architecture and folder layout – **ARCHITECTURE.md**
- Design tokens and minimal-CSS policy – **FOUNDATION.md**
- Deployment guidance – **DEPLOYMENT.md**
- Sidebar behaviour and validation flows – **TABS.md**
- Storybook playground – run `npm start`, open `http://localhost:6006`

---

_End of file._
