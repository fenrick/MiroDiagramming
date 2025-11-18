# Design-System Foundation

---

## 0 Purpose

- Guarantee visual parity with native Miro surfaces.
- Supply canonical **design tokens** for colour, spacing, typography, radii,
  elevation and motion.
- Document the **governance workflow** so tokens evolve in a controlled,
  backward-compatible way.

For component usage see **COMPONENTS.md**. For linting, testing and CI gates see
**ARCHITECTURE.md** (sections 4-6).

---

## 1 Token sources & install

| Asset                               | Package                                                      | Notes                                                  |
| ----------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| Raw CSS variables & utility classes | **@mirohq/design-system** (`pnpm add @mirohq/design-system`) | Adds `dist/styles.css` with all variables and helpers. |

````ts

## 2 Colour system

### 2.1 Primitive palette (CSS variables)

| Hue      | Variables                                              | Typical use                 |
| -------- | ------------------------------------------------------ | --------------------------- |
| Blue     | `--blue100` … `--blue900`                              | Primary buttons, links      |
| Indigo   | `--indigo50` … `--indigo700`, `--indigoAlpha*`         | Illustration accents        |
| Green    | `--green100`, `--green400`, `--green800`               | Success status              |
| Red      | `--red50` … `--red900`                                 | Destructive actions, errors |
| Yellow   | `--yellow100`, `--yellow400`, `--yellow700`            | Warnings                    |
| Neutrals | `--black`, `--blackAlpha*`, `--white`, `--whiteAlpha*` | Text, surfaces              |

Full list lives in the **Colors** documentation in the design system.

### 2.2 Semantic aliases

Create semantic tokens that map to primitives for clarity and easier theming:

| Semantic token               | Light mode      | Dark mode           |
| ---------------------------- | --------------- | ------------------- |
| `colour-surface-canvas`      | var(--white)    | var(--black)        |
| `colour-surface-card`        | var(--white)    | var(--blackAlpha80) |
| `colour-text-primary`        | var(--black)    | var(--white)        |
| `colour-interactive-primary` | var(--blue500)  | var(--blue300)      |
| `colour-status-success`      | var(--green700) | var(--green400)     |
| `colour-status-danger`       | var(--red700)   | var(--red400)       |

All pairings conform to **WCAG 2.2 AA** (contrast ≥ 4.5:1), verified by the
design-token verification script.

---

## 3 Spacing scale

The design-system spacing scale is **base-8 with a 4 px starter**.

| Token            | px  | Utility class      |
| ---------------- | --- | ------------------ |
| `space-xxxsmall` | 2   | `m-xxxs`, `p-xxxs` |
| `space-xxsmall`  | 4   | `m-xxs`, `p-xxs`   |
| `space-xsmall`   | 8   | `m-xs`, `p-xs`     |
| `space-small`    | 16  | `m-s`, `p-s`       |
| `space-medium`   | 24  | `m-m`, `p-m`       |
| `space-large`    | 32  | `m-l`, `p-l`       |
| `space-xlarge`   | 40  | `m-xl`, `p-xl`     |
| `space-xxlarge`  | 48  | `m-xxl`, `p-xxl`   |
| `space-xxxlarge` | 62  | `m-xxxl`, `p-xxxl` |

All layout primitives (**Grid, Stack, Cluster**) accept numeric props that
resolve to these tokens (see **COMPONENTS.md**).

---

## 4 Typography

| Class       | Token equivalent | Size / line | Purpose               |
| ----------- | ---------------- | ----------- | --------------------- |
| `.h1`       | font-heading-xl  | 32 / 40     | Modal or page titles  |
| `.h2`       | font-heading-l   | 24 / 32     | Section headers       |
| `.h3`       | font-heading-m   | 20 / 28     | Sub-section headers   |
| `.h4`       | font-heading-s   | 16 / 24     | Widget titles         |
| `.p-large`  | font-body-l      | 16 / 24     | Explanatory text      |
| `.p-medium` | font-body-m      | 14 / 20     | Default body text     |
| `.p-small`  | font-body-s      | 12 / 16     | Captions, helper text |

The design system exposes header and body fonts via `--header-font` and
`--body-font` variables.

---

## 5 Radii & elevation

| Token            | px   |
| ---------------- | ---- |
| `radius-small`   | 2    |
| `radius-medium`  | 4    |
| `radius-large`   | 8    |
| `radius-xlarge`  | 16   |
| `radius-xxlarge` | 32   |
| `radius-circle`  | 50 % |

Border-radius variables are defined by the design system and are re-exported by

our token module for easy consumption.

Elevation follows a four-level shadow ramp:

| Token         | Box-shadow             |
| ------------- | ---------------------- |
| `elevation-0` | none                   |
| `elevation-1` | 0 1 1 rgba(0,0,0,0.1)  |
| `elevation-2` | 0 2 4 rgba(0,0,0,0.12) |
| `elevation-3` | 0 4 8 rgba(0,0,0,0.14) |

---

## 6 Icons

- Use `<span class="icon icon-name">` to embed an icon.
- Icon SVGs sit under `node_modules/@mirohq/design-system-icons`.
- Do not recolour icons; prefer multi-tone assets shipped with the library. If
  recolouring is essential, apply a CSS filter (see design-system icon guide).

---

## 7 Motion tokens

| Name                   | Variable            | Cubic-bezier   | ms  |
| ---------------------- | ------------------- | -------------- | --- |
| motion-ease-in-out-200 | `--ease-in-out-200` | 0.4, 0 ,0.2, 1 | 200 |
| motion-ease-in-out-300 | `--ease-in-out-300` | 0.4, 0 ,0.2, 1 | 300 |
| motion-ease-in-out-400 | `--ease-in-out-400` | 0.4, 0 ,0.2, 1 | 400 |

Use the shortest token that achieves perceptible feedback; avoid motion on large
canvases where it may distract.

---

## 8 Minimal-CSS policy

- **Never** hard-code hex, rgb, px, em or rem outside token definitions.
- Custom classes only to integrate third-party libs and must start with `ext-`.
- ESLint rule `design-tokens/no-raw-values` blocks non-token values.
- Inline `style` attributes are disallowed (rule `no-inline-style`).
- Dark-mode styles derive automatically from design-system variables; no extra
  overrides.

---

## 9 Dark-mode verification workflow

1. Storybook builds in Light & Dark.
2. `jest-image-snapshot` compares screenshots from both themes (≤ 0.1 % diff).
3. Failures block merge; engineering owner fixes token mapping.

---

## 10 Token governance

| Step                                                    | Actor                        | Tool                             |
| ------------------------------------------------------- | ---------------------------- | -------------------------------- |
| 1. Propose token (Figma style link + rationale)         | Designer / Engineer          | Pull request in `design-tokens/` |
| 2. Auto-check (naming, duplicates, contrast, dark-mode) | CI bot                       | `pnpm run tokens:verify`         |
| 3. Dual approval                                        | Design lead + Eng maintainer | GitHub review                    |
| 4. Merge & release                                      | semantic-release             | GitHub Actions                   |
| 5. Consume in components                                | Component owners             | Follow-up PR                     |

Schema is validated by **AJV**; breaking changes require a major version bump.

---

## 11 Tooling quick-start

```bash
# List tokens
pnpm run tokens:list

# Verify contrast / naming
pnpm run tokens:verify

# Regenerate d.ts typings for local tokens
pnpm run tokens:gen-types
````

---

## 12 Future enhancements

| Idea                           | Benefit                                  | Target      |
| ------------------------------ | ---------------------------------------- | ----------- |
| Motion token ramp (100-600 ms) | Consistent animation scale               | Q4-2025     |
| Illustration colour tokens     | Align empty-state artwork                | Q1-2026     |
| Algorithmic dark theme         | Auto-generate tokens, reduce maintenance | Exploration |

---

_End of file._
