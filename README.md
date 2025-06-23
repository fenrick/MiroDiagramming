# Miro JSON Graph Diagram App

This project demonstrates how to import a JSON description of a graph and build
a diagram on a Miro board. The application uses the **Eclipse Layout Kernel
(ELK)** to arrange nodes and edges automatically. Shapes are generated from
templates and each element can carry metadata that controls its appearance and
placement.

## Uploading JSON Content

1. Click the app icon on your Miro board.
2. In the **Create** tab choose whether to import a diagram or cards.
3. Select a `.json` file. Diagrams require `nodes` and `edges` while the cards
   option expects an object with a `cards` array.
4. Once processed, widgets are placed on the board using the selected mode.
5. See [`tests/fixtures/sample-cards.json`](tests/fixtures/sample-cards.json)
   for a cards format example.

## ELK Layout

The layout step leverages the ELK algorithm to compute positions for all nodes.
You can provide layout hints in each node's metadata to influence spacing or
layering. The engine runs automatically when a graph is uploaded.

## Template‑Based Shapes

Shape templates live in
[`templates/shapeTemplates.json`](templates/shapeTemplates.json). Each template
defines the shape type, size and base styles. When a node specifies a `template`
value in its metadata the corresponding template is applied. Edit this file or
add new entries to customize the available shapes. Connector appearance is
configured in
[ `templates/connectorTemplates.json`](templates/connectorTemplates.json) which
controls line color, caps and font. The templates now include `Decision` and
`StartEnd` shapes useful for flowcharts.

To add your own templates create new entries in these JSON files and reference
them by name in your graph metadata. The app reloads templates on startup so
changes are picked up automatically.

## Metadata Usage

Nodes may include a `metadata` object with any additional information. Typical
fields are:

- `template`: name of the shape template to use.
- `label`: text displayed on the shape.
- `elk`: optional layout properties passed directly to the ELK engine.
- `width` and `height`: optional dimensions overriding the template values.
- `connectorTemplate`: template name for edge styling.
- Connector endpoints snap to the sides suggested by the ELK layout.
- Note: groups cannot store metadata. When a template does create a group the
  metadata is applied to each element within the group instead. Simple templates
  set the label directly on the shape to avoid grouping.

## Sample Graph

A small example is provided in
[tests/fixtures/sample-graph.json](tests/fixtures/sample-graph.json):

```json
{
  "nodes": [
    {
      "id": "n1",
      "label": "Customer",
      "type": "Role"
    },
    {
      "id": "n2",
      "label": "Service",
      "type": "BusinessService"
    }
  ],
  "edges": [
    {
      "from": "n1",
      "to": "n2",
      "label": "uses"
    }
  ]
}
```

## Accessibility

The import panel is keyboard accessible. The drop area includes an ARIA label
and hidden instructions so screen readers announce how to operate it. Focus the
area with the Tab key and press **Enter** to open the file picker. The mode
selection radios are grouped with a descriptive label.

## Additional Tools

The sidebar exposes extra tabs to manipulate existing widgets:

- **Resize** allows copying a widget size and applying it to others. You can
  also type width and height manually. When a size is copied the same button
  becomes a **Reset Copy** action so you can quickly revert. The tool displays
  conversions between board units, millimetres and inches based on the ratio
  `96 units = 1 inch`.
- **Style** sets common style properties like fill colour or border width on all
  selected items. The tab shows the current fill colour swatch and updates when
  the selection changes. A slider lightens or darkens the colour while keeping
  the text readable.
- **Grid** arranges widgets into a grid with options for sorting and grouping
  the result.
- **Templates** inserts prebuilt diagrams from the templates catalog.
- **Export** allows saving the board to PNG, SVG, BPMN or Markdown.
- **Data** configures live data bindings to external sources.
- **Comment** lists discussion threads and lets you reply inline.

## Setup

- [Miro Web SDK](https://developers.miro.com/docs/web-sdk-reference)
  - [miro.board.ui.openPanel()](https://developers.miro.com/docs/ui_boardui#openpanel)

## 🛠️ Tools and Technologies <a name="tools"></a>

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)

## Styling with Mirotone

The CSS for this project imports
[`mirotone/dist/styles.css`](https://www.mirotone.xyz/css) in
[`src/assets/style.css`](src/assets/style.css) to match the Miro UI. When adding
new UI elements reuse the Mirotone utility classes such as `button`,
`button-primary` and the grid helpers so your components align with existing
styles. Avoid custom CSS when a utility class exists. Interactive elements
should use the wrapper components under `src/ui/components/legacy`.

## Form Design Guidelines

When creating forms use the wrapper components so your inputs and buttons match
the rest of the UI. These guidelines help keep layouts consistent:

- Use `InputField` to pair labels with their controls.
- Group related fields using `FormGroup` to maintain spacing and a clear
  vertical rhythm.
- Arrange elements with the 12‑column grid classes (`cs*`/`ce*`) so forms remain
  responsive.
- Use values from `src/ui/tokens.ts` for margins and padding instead of
  hard‑coded numbers.
- When customisation is needed prefer extending Mirotone variables over creating
  bespoke CSS classes.
- Stick to the provided `Button` component and choose the `primary` variant for
  the main action. Place secondary actions on the right using the `buttons`
  wrapper as seen in the tabs.
- Keep labels short and descriptive. When extra context is required add a
  `Paragraph` element next to the fields.
- For drag‑and‑drop zones include an ARIA label and hidden instructions so
  screen readers describe the workflow.

## ✅ Prerequisites <a name="prerequisites"></a>

- You have a [Miro account](https://miro.com/signup/).
- You're [signed in to Miro](https://miro.com/login/).
- Your Miro account has a
  [Developer team](https://developers.miro.com/docs/create-a-developer-team).
- Your development environment includes
  [Node.js](https://nodejs.org/en/download) v18 or v20.
- All examples use `npm` as a package manager and `npx` as a package runner.

## 📖 Associated Developer Tutorial <a name="tutorial"></a>

See the Miro documentation for details on building diagramming apps.

## 🏃🏽‍♂️ Run the app locally <a name="run"></a>

1. Run `npm install` to install dependencies.
2. Run `npm start` to start the development server. \
   Your URL should be similar to this example:

```
 http://localhost:3000
```

3. Open the
   [app manifest editor](https://developers.miro.com/docs/manually-create-an-app#step-2-configure-your-app-in-miro)
   by clicking **Edit in Manifest**. \
   In the app manifest editor, configure the app as follows, and then click
   save:

```yaml
# See https://developers.miro.com/docs/app-manifest on how to use this
appName: JSON Diagram
sdkVersion: SDK_V2
sdkUri: http://localhost:3000
scopes:
  - boards:read
  - boards:write
```

4. Go back to your app home page, and under the `Permissions` section, you will
   see a blue button that says `Install app and get OAuth token`. Click that
   button. Then click on `Add` as shown in the video below. <b>In the video we
   install a different app, but the process is the same regardless of the
   app.</b>

> ⚠️ We recommend to install your app on a
> [developer team](https://developers.miro.com/docs/create-a-developer-team)
> while you are developing or testing apps.⚠️

https://github.com/miroapp/app-examples/assets/10428517/1e6862de-8617-46ef-b265-97ff1cbfe8bf

5. Go to your developer team, and open your boards.
6. Click on the plus icon from the bottom section of your left sidebar. If you
   hover over it, it will say `More apps`.
7. Search for your app `JSON Diagram` or whatever you chose to name it. Click on
   your app to use it, as shown in the video below. <b>In the video we search
   for a different app, but the process is the same regardless of the app.</b>

https://github.com/horeaporutiu/app-examples-template/assets/10428517/b23d9c4c-e785-43f9-a72e-fa5d82c7b019

## Testing

Before running the checks make sure dependencies are installed:

```bash
npm install
```

Then validate the codebase with:

```bash
npm run typecheck --silent
npm test --silent
npm run lint --silent
npm run prettier --silent
```

These commands perform TypeScript type checking, execute the Jest suite, run
ESLint and format files with Prettier. Run them before committing so code
conforms to the repository guidelines.

## Building a Production Bundle

Run `npm run build` to create the optimized static files in the `dist/` folder.
Host these files on a web server and update the `sdkUri` in your app manifest to
point to the deployed bundle.

## 🗂️ Folder structure <a name="folder"></a>

```
.
├── src
│   ├── core
│   │   ├── graph
│   │   ├── layout
│   │   └── utils
│   ├── ui
│   │   ├── components
│   │   ├── hooks
│   │   └── pages
│   └── app
├── public         // icons and i18n JSON
├── scripts        // build helpers
└── index.html     // entry point specified as App URL
```

## 📚 Additional Design Docs

- [Architecture](docs/ARCHITECTURE.md) explains how the source modules are
  organised.
- [Tab Overview](docs/TABS.md) describes the sidebar tabs and their purpose.
- [Deployment Guide](docs/DEPLOYMENT.md) shows how to build and host the bundle.
- [Components Catalogue](docs/COMPONENTS.md) documents reusable React
  components.
- [Design Foundation](docs/FOUNDATION.md) explains tokens and theming rules.
- [UI Patterns](docs/PATTERNS.md) shows common layouts and best practices.

## 🫱🏻‍🫲🏽 Contributing <a name="contributing"></a>

If you want to contribute to this example, or any other Miro Open Source
project, please review
[Miro's contributing guide](https://github.com/miroapp/app-examples/blob/main/CONTRIBUTING.md).

## 🪪 License <a name="license"></a>

This software is released into the public domain under [The Unlicense](LICENSE).
See the LICENSE file for details.
