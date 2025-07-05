# Template Authoring Guide

---

## 0 Purpose

Explain how shape and connector templates are defined and consumed by the
diagramming add-on. This allows designers to tweak sizes and styles without
touching the code.

---

## 1 Shape Templates

Shape templates live in
[`templates/shapeTemplates.json`](../templates/shapeTemplates.json). The same
dataset drives the Style tab so each template can be applied as a style preset.
Each entry describes one or more elements that make up a widget. The minimal
form is:

```json
"Motivation": {
  "elements": [
    { "shape": "round_rectangle", "width": 160, "height": 60, "text": "{{label}}" }
  ],
  "alias": ["Stakeholder", "Driver"]
}
```

Aliases allow templates to be referenced using alternative names. In this
example both `Stakeholder` and `Driver` resolve to the `Motivation` template.

Colour values must reference the official design tokens using the
`tokens.color.<name>[shade]` syntax. These are resolved at runtime to CSS
variables and fallback hex codes.

The `text` field supports the `{{label}}` placeholder which is replaced with the
node's label. Additional `style` properties use the same keys as the Web SDK
widgets and support design tokens such as `"tokens.color.yellow[150]"`.

Connector styling is defined in
[`templates/connectorTemplates.json`](../templates/connectorTemplates.json) and
follows the same pattern.

---

## 2 Configuration

Templates are loaded by the `TemplateManager` at runtime. To reference a
template simply set `type` on a node or supply a `template` name in the node's
metadata. Connector templates are chosen via the edge's `metadata.template`
value.

---

## 3 Sample Data

A three-level hierarchical dataset can be found in
[`tests/fixtures/sample-hier.json`](../tests/fixtures/sample-hier.json). It
contains four top-level groups, each with four subgroups and four items per
subgroup. This is useful when experimenting with the ELK-based nested layout
algorithm. Import the JSON in the **Create** tab and choose the **Nested**
diagram layout to see child nodes arranged inside their parents with containers
sized automatically by the ELK engine. For a description of available algorithms
see [LAYOUT_OPTIONS.md](LAYOUT_OPTIONS.md).

---

The UI for template selection is part of the Quick Tools add-on running on a
Miro board. All widgets are created through the Miro Web SDK and can be
customised by editing the template files.
