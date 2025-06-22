# Re-usable UX Patterns for the Miro Web-SDK Add-on

---

## 1 Form Design

### 1.1 Layout anatomy

| Rule                      | Detail                                                                                            | Rationale                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Label above field**     | Labels are left-aligned, 4 px from the top of the control.                                        | Works in narrow sidebars and wide modals without horizontal eye-scanning.                        |
| **One column by default** | Use a two-column **Grid** only when all fields are short and the dialog is ≥ 640 px.              | Prevents unpredictable tab order on small widths.                                                |
| **Group related fields**  | Wrap each logical group in **fieldset** and render the **legend** visually hidden but accessible. | Screen-reader users announce group purpose before individual controls. ([universaldesign.ie][1]) |
| **Vertical rhythm**       | Between controls = space-small (16 px). Between groups = space-medium (24 px).                    | Matches Mirotone 8-pt grid.                                                                      |
| **Help text**             | Place below the control in font-body-s neutral-600. Max 80 characters.                            | Maintains consistent scan path.                                                                  |

### 1.2 Required, optional and disabled

| State    | Indicator                                                       | Token reference      |
| -------- | --------------------------------------------------------------- | -------------------- |
| Required | Add solid red 700 asterisk after the label; aria-required true. | colour-status-danger |
| Optional | No text suffix; optional fields should be rare.                 | —                    |
| Disabled | Reduce opacity to 40 % and remove from tab order.               | opacity-disabled     |

Never mix disabled and read-only; read-only fields must still get focus.

### 1.3 Validation lifecycle

| Step         | Trigger                                     | Visual cue                                                                | Voice-over cue               |
| ------------ | ------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------- |
| **Pristine** | Field has never been blurred.               | Neutral outline-100.                                                      | No announcement.             |
| **Dirty**    | On blur, if invalid.                        | Outline-danger-500, icon-alert-16 inside right padding, error text below. | ‘Error. {label}. {message}’. |
| **Async**    | After passing sync rules, start async call. | Inline **Spinner** 16 × 16 on right; keep outline-primary-300.            | ‘Validating…’.               |
| **Success**  | Async success.                              | Outline-success-500 for 1 s then revert to neutral.                       | ‘Valid’.                     |

Invalid state must set aria-invalid true and point to error text via aria-describedby. ([developer.mozilla.org][2])

### 1.4 Progressive disclosure & dynamic fields

* Hide rarely-used settings inside an **Accordion** labelled ‘Advanced’.
* If a later question depends on an earlier answer, use **react-hook-form** watch to conditionally render the field; never disable a visible control because hidden fields are skipped by assistive tech.

### 1.5 Keyboard and focus contract

1. First interactive element receives programmatic focus.
2. Tab order always matches DOM order.
3. Enter inside any input triggers the primary action if no validation errors exist.
4. Escape closes the current **Modal** or **SidebarTab** unless a blocking destructive-confirm is shown.

---

## 2 Tabs & Navigation

### 2.1 Horizontal TabBar

| Attribute       | Value                                                                                          | Source                                       |
| --------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Container role  | tablist                                                                                        | WAI ARIA Tabs Pattern ([w3.org][3])          |
| Tab role        | tab                                                                                            |                                              |
| Panel role      | tabpanel                                                                                       |                                              |
| Keyboard        | Left/Right to move focus, Home/End to first/last, Space/Enter to activate (manual activation). | APG example ([w3.org][4])                    |
| Activation mode | **manual** – focusing does not switch panel until explicit activation.                         | Prevents large canvas redraw while arrowing. |
| Deep-link       | Append #tab-{id}. Router selects panel on load.                                                | Enables bookmarking.                         |

### 2.2 Sidebar tabs (primary navigation)

See **TABS.md** for full blueprint.
Additional rules:

* Never nest more than one tabset per view.
* Keep persistent tabs count ≤ 5; overflow icons collapse into **More** popover.
* Provide keyboard shortcuts Control Alt 1–9 to jump between tabs (documented in on-boarding).

---

## 3 Feedback & Status

### 3.1 Toast

| Parameter   | Default                         | Severe error                |
| ----------- | ------------------------------- | --------------------------- |
| Max width   | 320 px                          | 480 px                      |
| Placement   | Bottom centre                   | Bottom centre               |
| Duration    | 4 s                             | Sticky until user dismisses |
| Stack limit | 3; new pushes oldest off-screen | 1                           |

Toast container has aria-live polite; error toasts switch to assertive for immediate read-out.

### 3.2 Inline Alert

Colour and icon follow semantic tokens:

* Success – colour-status-success + icon-check-circle-20.
* Info – colour-interactive-primary + icon-info-20.
* Warning – colour-status-warning + icon-warning-20.
* Danger – colour-status-danger + icon-alert-20.

Alert header uses font-heading-s; body uses font-body-s with max 160 characters.

### 3.3 Progress indicators

| Choose       | When                                            | Component                                              |
| ------------ | ----------------------------------------------- | ------------------------------------------------------ |
| Spinner      | Unknown duration < 10 s                         | Spinner size 40 × 40 centred                           |
| Skeleton     | Unknown 400–1 200 ms but with predictable shape | Skeleton rectangle blocks with shimmer motion-ease-200 |
| Progress bar | Known duration > 700 ms                         | Progress determinate; show percent text after 10 %     |

---

## 4 Empty States

### 4.1 Copy checklist

1. State what is missing — 1 short clause.
2. Explain why — if not obvious.
3. Provide single primary action — imperative verb.
   Total ≤ 2 sentences (max 140 characters).

### 4.2 Illustration guidelines

* Use multitone SVGs from Miro style set; palette restricted to Indigo 50–700, Blue 50–500 and Neutral 200–600.
* Light mode: illustration opacity 100 %. Dark mode: reduce white fills to 80 % opacity.
* Size tiers:

  * Sidebar small — 48 × 48 px, centred.
  * Modal medium — 120 × 120 px, top-centre.
  * Full-panel large — 240 × 160 px, centred.

---

## 5 Dialogs & Modals

| Tier   | Width  | Padding      | Use cases                       |
| ------ | ------ | ------------ | ------------------------------- |
| Small  | 320 px | space-medium | Confirm, alert, feedback        |
| Medium | 480 px | space-large  | Forms up to 6 fields            |
| Large  | 640 px | space-large  | Rare – wizard step, file import |

* Overlay colour-blackAlpha-600 at 50 % opacity; fade-in 150 ms motion-ease-200.
* Focus trap loops within modal.
* Background scroll locked by adding overflow hidden to body.
* Escape closes modal except when **confirm dangerous action**.

---

## 6 Pattern-level Accessibility Checklist

| Item                       | Technique                                                | Source                                             |
| -------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| Interactive reached by Tab | Start from body and tab through all controls.            | Miro design guidelines ﻿([developers.miro.com][5]) |
| Visible focus ring ≥ 2 px  | Outline colour-interactive-primary, offset 2 px.         | WCAG 2 .2 SC 2.4.7                                 |
| Form landmarks named       | Add aria-labelledby or aria-label to each form element.  | MDN form role ﻿([developer.mozilla.org][2])        |
| Tabs WAI-ARIA pattern      | Roles, keyboard, tabpanel tabindex 0 when no focusables. | APG tabs pattern ﻿([w3.org][3])                    |
| Error text linked          | aria-describedby points to inline error id.              | WebAIM                                             |
| Live region for toasts     | aria-live polite (assertive for danger).                 | W3C ARIA                                           |

All points are enforced by automated axe-core tests in CI (see **ARCHITECTURE.md**).

---

## 7 Additional Patterns (brief stubs)

| Name                   | Purpose                                   | Status              |
| ---------------------- | ----------------------------------------- | ------------------- |
| Accordion              | Progressive disclosure in forms           | Implemented         |
| Tooltip                | Contextual help on icon buttons           | Needs React wrapper |
| Data table (read-only) | Present static tabular info; no sorting   | Planned Q4-2025     |
| Card list              | Board-linked items with thumbnail + title | Implemented         |

Detailed specs will be added as these patterns stabilise.

---

## 8 Pattern Backlog (next 12 months)

| Idea                        | Benefit                             | Earliest kick-off |
| --------------------------- | ----------------------------------- | ----------------- |
| Split-pane resizable layout | Advanced data-entry flows           | Q1-2026           |
| Inline-edit grid            | Faster single-cell edits            | Q2-2026           |
| In-product tour             | Accelerates first-time-user success | Research          |

---

*End of file.*
