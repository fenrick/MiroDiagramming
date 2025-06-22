# Design System Foundation  
_Single source of truth for tokens, principles, typography, layout, theming & accessibility (June 2025)_

---

## 1  Purpose  
Provide every stakeholder—designer, developer, product manager—with a **plain-language, self-contained reference** for the visual language of Miro Web-SDK add-ons. No external links required.

---

## 2  Design Principles  

| Principle | Description |
|-----------|-------------|
| **Library-first, token-native** | Build UIs exclusively with `mirotone-react` and reference tokens programmatically. |
| **Consistency & Predictability** | One colour map, one spacing scale, one grid—no per-feature variations. |
| **Accessibility-first** | WCAG 2.2 AA compliance (contrast, reflow, focus management). |

---

## 3  Design Tokens  

### 3.1  Spacing Scale (`tokens.space.*`)

| Token  | px | Intended use                |
|--------|----|-----------------------------|
| `xxxs` | 2  | Icon adjustments            |
| `xxs`  | 4  | Very tight gaps             |
| `xs`   | 8  | Inline element gaps         |
| `sm`   | 16 | Between related controls    |
| `md`   | 24 | Between form rows / padding |
| `lg`   | 32 | Dialog & section padding    |
| `xl`   | 40 | Card gutters                |
| `xxl`  | 48 | Page gutters                |
| `xxxl` | 64 | Hero / empty-state spacing  |

### 3.2  Border-Radius Tokens

| Token      | px |
|------------|----|
| `small`    | 2  |
| `medium`   | 4  |
| `large`    | 8  |
| `xlarge`   | 16 |
| `xxlarge`  | 32 |
| `circle`   | 50 % |

### 3.3  Colour Palette (excerpt)

| Token              | Hex        | Usage                     |
|--------------------|-----------|---------------------------|
| `blue[900]`        | `#0D1B52` | Header text               |
| `blue[500]`        | `#1A64F0` | Primary buttons & links   |
| `green[800]`       | `#0A6631` | Success states            |
| `red[600]`         | `#D7263D` | Destructive / errors      |
| `yellow[400]`      | `#FFDB00` | Warnings                  |
| `blackAlpha60`     | `rgba(0,0,0,.6)` | Secondary text |

> **Rule:** reference tokens in code—never inline hex values.

### 3.4  Typography Scale

| Semantic   | Component / Class             | Size (px) | Weight |
|------------|------------------------------|-----------|--------|
| **H1**     | `<Title level={1}>`          | 32 / 40   | 600    |
| **H2**     | `<Title level={2}>`          | 24 / 32   | 600    |
| **H3**     | `<Title level={3}>`          | 20 / 28   | 600    |
| **H4**     | `<Title level={4}>`          | 16 / 24   | 600    |
| Body–large | `<Text variant="large">`     | 16        | 400    |
| Body–med   | `<Text>`                     | 14        | 400    |
| Body–small | `<Text variant="small">`     | 12        | 400    |

### 3.5  Layout Grid  

| Breakpoint | Viewport (px) | Columns | Gutter |
|------------|---------------|---------|--------|
| **xs**     | 0-479         | 4       | 8 px   |
| **sm**     | 480-767       | 8       | 8 px   |
| **md**     | 768-1023      | 12      | 16 px  |
| **lg**     | 1024-1439     | 12      | 24 px  |
| **xl**     | ≥ 1440        | 12      | 32 px  |

> Columns auto-wrap below **md**, guaranteeing no horizontal scroll at 400 % zoom.

---

## 4  Theming  

* Mirotone tokens auto-switch for light and dark modes.  
* **Do not** hard-code colours or backgrounds.  
* Verify UI in both themes via **Developer → Interface Theme**.

---

## 5  Accessibility Guidelines  

1. **Contrast:** text ↔ background ≥ 4.5 : 1.  
2. **Reflow:** No horizontal scroll up to 400 % zoom.  
3. **Focus not obscured:** visible ring after scroll or modal open.  
4. **Semantic roles:** `mirotone-react` components expose correct ARIA; extend only with valid `aria-*` attributes.

---

## 6  Minimal-CSS Policy  

Custom CSS is **discouraged**. Allowed only when:

* `mirotone-react` lacks required capability.  
* Scoped via CSS Modules or Emotion.  
* Class names prefixed `custom-`.  
* A Figma/Jira link explaining the need is placed in the file header.

---

## 7  Governance  

| Area                  | Owner                   | Review cadence |
|-----------------------|-------------------------|----------------|
| Tokens & principles   | Design Systems Lead     | Quarterly      |
| Accessibility         | Accessibility Champion  | Quarterly      |
| Theming & dark mode   | Platform Engineering    | As-needed      |

_Always update this foundation **before** any breaking visual change ships._
