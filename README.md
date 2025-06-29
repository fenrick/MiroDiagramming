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
   Cards are automatically arranged in a grid with a calculated number of
   columns. Pass `columns` when invoking the importer to override this value.
5. See [`tests/fixtures/sample-cards.json`](tests/fixtures/sample-cards.json)
   for a cards format example.

### Card JSON Format

Each card entry must specify a `title`. All other properties are optional:

- `description`: Markdown or plain text body
- `tags`: array of tag names to assign. These are mapped to the widget's
  `tagIds` field when cards are created or updated
- `style`: card appearance (theme and background)
- `fields`: custom preview fields shown on the card
- `taskStatus`: Kanban status such as `to-do`

Omitting the `fields` property leaves the card without preview items.

## ELK Layout

The layout step leverages the ELK algorithm to compute positions for all nodes.
You can provide layout hints in each node's metadata to influence spacing or
layering. The engine runs automatically when a graph is uploaded. For an
overview of available layout algorithms see
[docs/LAYOUT_OPTIONS.md](docs/LAYOUT_OPTIONS.md). The ELK engine is dynamically
imported from the jsDelivr CDN so it is excluded from the application bundle.

## Template‑Based Shapes

Shape templates live in
[`templates/shapeTemplates.json`](templates/shapeTemplates.json). Each template
defines the shape type, size and base styles. These templates also act as style
presets, exposing the buttons on the Style tab. When a node specifies a
`template` value in its metadata the corresponding template is applied. Edit
this file or add new entries to customise the available shapes. Connector
appearance is configured in
[ `templates/connectorTemplates.json`](templates/connectorTemplates.json) which
controls line colour, caps and font. The templates now include `Decision` and
`StartEnd` shapes useful for flowcharts. To add your own templates create new
entries in these JSON files and reference them by name in your graph metadata.
The app reloads templates on startup so changes are picked up automatically.
Additional details and a sample dataset are provided in
[`docs/TEMPLATES.md`](docs/TEMPLATES.md).

When **Use existing widgets** is enabled the importer caches all basic shapes on
the board and matches them by their text content. The cache prevents duplicates
during placement and is cleared once processing finishes.

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
    { "id": "n1", "label": "Customer", "type": "Role" },
    { "id": "n2", "label": "Service", "type": "BusinessService" }
  ],
  "edges": [{ "from": "n1", "to": "n2", "label": "uses" }]
}
```

## Nested Layouts

Hierarchical data where children are contained within parent shapes can be
visualised using the **Nested** layout option in the Diagram tab. Positions and
container sizes are computed entirely by the ELK engine for consistent spacing.
Nodes are sorted alphabetically by default or via a custom metadata key. A
three‑level sample dataset is available at
[tests/fixtures/sample-hier.json](tests/fixtures/sample-hier.json). Simply
select **Nested** and import this file to see parent widgets sized to fit their
children. If a standard flat graph is supplied instead, the importer will raise
an error indicating an invalid hierarchy.

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
- **Frames** renames or locks selected frames via helper utilities.
- **Export** allows saving the board to PNG, SVG, BPMN or Markdown.
- **Data** configures live data bindings to external sources.
- **Comment** lists discussion threads and lets you reply inline.
- **Search** finds text across the board and can replace all matches.

### Search Tools

Utility helpers `searchBoardContent` and `replaceBoardContent` can query or
update widgets by text. They support filtering by widget type, tag ID, fill
colour, assignee, creator and last modifier. Searches may be case sensitive,
whole-word or regular expression based and can be limited to the current
selection. The search tab exposes checkboxes for these modes alongside **Next**
to jump through results and **Replace** for single substitutions. During
replacements the board viewport focuses on each matched item so you can review
changes. See the [Search tab walkthrough](docs/TABS.md#10-search-tab) for the
complete UI flow.

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
- Use real heading tags with visible text so screen readers announce sections.
- For drag‑and‑drop zones include an ARIA label and hidden instructions so
  screen readers describe the workflow.

## ✅ Prerequisites <a name="prerequisites"></a>

- You have a [Miro account](https://miro.com/signup/).
- You're [signed in to Miro](https://miro.com/login/).
- Your Miro account has a
  [Developer team](https://developers.miro.com/docs/create-a-developer-team).
- Your development environment includes
  [Node.js](https://nodejs.org/en/download) v24 or later.
- All examples use `npm` as a package manager and `npx` as a package runner.

## 🏃🏽‍♂️ Run the app locally <a name="run"></a>

1. Run `npm install` to install dependencies. The project includes a
   `package-lock.json` file so everyone installs the same versions.
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
   > https://github.com/miroapp/app-examples/assets/10428517/1e6862de-8617-46ef-b265-97ff1cbfe8bf
5. Go to your developer team, and open your boards.
6. Click on the plus icon from the bottom section of your left sidebar. If you
   hover over it, it will say `More apps`.
7. Search for your app `JSON Diagram` or whatever you chose to name it. Click on
   your app to use it, as shown in the video below. <b>In the video we search
   for a different app, but the process is the same regardless of the app.</b>
   https://github.com/horeaporutiu/app-examples-template/assets/10428517/b23d9c4c-e785-43f9-a72e-fa5d82c7b019

## Testing

The root `AGENTS.md` lists the commands to run before committing. Be sure to
install dependencies first:

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

These commands perform TypeScript type checking, execute the **Vitest** suite
with coverage enabled, run ESLint and format files with Prettier. Aim for at
least 90 % line and branch coverage and keep cyclomatic complexity under eight
(see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)). ESLint enforces additional
Sonar rules such as using `readonly` class fields, optional chaining, semantic
HTML tags and stable React keys. Run these checks before committing so code
conforms to the repository guidelines.

With `package-lock.json` checked in you can run `npm audit` after each install
to scan dependencies for vulnerabilities. Include the lock file in commits so
everyone uses the exact dependency versions when installing.

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
- [Deployment & Build Guide](docs/DEPLOYMENT.md) explains how to build and host
  the bundle.
- [Components Catalogue](docs/COMPONENTS.md) documents reusable React
  components.
- [Design Foundation](docs/FOUNDATION.md) explains tokens and theming rules.
- [Code Style](docs/CODE_STYLE.md) outlines formatting and naming rules.
- [UI Patterns](docs/PATTERNS.md) shows common layouts and best practices.
- [Excel Import](docs/EXCEL_IMPORT.md) details workbook loading and sync.

## Docker Image

The project can be packaged as a container image. Build and run using:

```bash
docker build -t miro-diagramming .
docker run --rm -p 8080:80 miro-diagramming
```

Tagged releases push the image to the GitHub Container Registry automatically.
The workflow builds a standard `linux/amd64` image via
`docker/build-push-action@v5`; QEMU is unnecessary as no cross-platform
emulation is performed.

## Docker Image

The project can be packaged as a container image. Build and run using:

```bash
docker build -t miro-diagramming .
docker run --rm -p 8080:80 miro-diagramming
```

Tagged releases push the image to the GitHub Container Registry automatically.
The workflow builds a standard `linux/amd64` image via
`docker/build-push-action@v5`; QEMU is unnecessary as no cross-platform
emulation is performed.

## Docker Image

The project can be packaged as a container image. Build and run using:

```bash
docker build -t miro-diagramming .
docker run --rm -p 8080:80 miro-diagramming
```

Tagged releases push the image to the GitHub Container Registry automatically.
The workflow builds a standard `linux/amd64` image via
`docker/build-push-action@v5`; QEMU is unnecessary as no cross-platform
emulation is performed.

## Docker Image

The project can be packaged as a container image. Build and run using:

```bash
docker build -t miro-diagramming .
docker run --rm -p 8080:80 miro-diagramming
```

Tagged releases push the image to the GitHub Container Registry automatically.
The workflow builds a standard `linux/amd64` image via
`docker/build-push-action@v5`; QEMU is unnecessary as no cross-platform
emulation is performed.

## Docker Image

The project can be packaged as a container image. Build and run using:

```bash
docker build -t miro-diagramming .
docker run --rm -p 8080:80 miro-diagramming
```

Tagged releases push the image to the GitHub Container Registry automatically.
The workflow builds a standard `linux/amd64` image via
`docker/build-push-action@v5`; QEMU is unnecessary as no cross-platform
emulation is performed.

## Changelog

Release notes are generated by
[semantic-release](https://github.com/semantic-release/semantic-release) and
appended to `CHANGELOG.md` in the repository root. When submitting a pull
request, add a bullet under the **Unreleased** heading summarising your change.

## 🫱🏻‍🫲🏽 Contributing <a name="contributing"></a>

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and
the development workflow.

## 🪪 License <a name="license"></a>

This software is released into the public domain under [The Unlicense](LICENSE).
See the LICENSE file for details.
