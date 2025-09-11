# Quick Tools

[![CI](https://github.com/fenrick/MiroDiagramming/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fenrick/MiroDiagramming/actions/workflows/ci.yml?query=branch%3Amain)

Quick Tools imports graphs or cards from JSON or Excel files and builds diagrams
on a Miro board. The application uses the **Eclipse Layout Kernel (ELK)** to
arrange nodes and edges automatically. Shapes are generated from templates and
each element can carry metadata that controls its appearance and placement.

## Quickstart

### Prerequisites

- Node.js 20.x

The app runs as a single Node.js process that serves both the API and the React frontend.

### Environment

Create a `.env` file at the repository root. Minimum:

```
DATABASE_URL=file:./app.db
MIRO_CLIENT_ID=your-client-id
MIRO_CLIENT_SECRET=your-client-secret
MIRO_REDIRECT_URL=http://localhost:3000/auth/miro/callback
MIRO_WEBHOOK_SECRET=change-me
# JSON array of allowed cross-origin URLs (optional)
CORS_ORIGINS=["http://localhost:3000"]
# Interval for removing stale idempotency keys (optional)
MIRO_IDEMPOTENCY_CLEANUP_SECONDS=86400
# Queue tuning (optional)
QUEUE_CONCURRENCY=2
QUEUE_MAX_RETRIES=5
QUEUE_BASE_DELAY_MS=250
QUEUE_MAX_DELAY_MS=5000
```

`MIRO_WEBHOOK_SECRET` verifies webhook callbacks. Signatures are computed over the
raw request body using `@fastify/raw-body`.

`MIRO_IDEMPOTENCY_CLEANUP_SECONDS` controls how often old idempotency entries are removed.

`QUEUE_CONCURRENCY`, `QUEUE_MAX_RETRIES`, `QUEUE_BASE_DELAY_MS`, and `QUEUE_MAX_DELAY_MS`
allow tuning the in-memory change queue's worker count and backoff strategy.

### Development

Run a single dev process (Fastify + Vite middleware):

```bash
npm install
npm run dev
```

Production build and start:

```bash
npm run build
npm start
```

## Uploading JSON Content

1. Click the app icon on your Miro board.
2. In the **Create** tab choose whether to import a diagram or cards.
3. Select a `.json` file. Diagrams require `nodes` and `edges` while the cards
   option expects an object with a `cards` array.
4. Once processed, widgets are placed on the board using the selected mode.
   Cards are automatically arranged in a grid with a calculated number of
   columns. Pass `columns` when invoking the importer to override this value.
5. An example card structure is shown below.

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

## Identification

Widgets no longer rely on metadata. Shapes and groups are matched purely by
their text content. When updating a diagram the importer searches for a shape
whose content matches the node label. Cards continue to encode their identifier
in the description using the `ID:` prefix.

## Sample Graph

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
Nodes are sorted alphabetically by default or via a custom metadata key.

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
- **Frames** renames or locks selected frames via helper utilities.
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

## Styling with the Miro Design System

The CSS for this project imports `@mirohq/design-system-themes/light.css` in
[`src/frontend/assets/style.css`](src/frontend/assets/style.css)
to match the Miro UI. Components are sourced from `@mirohq/design-system`.
Avoid custom CSS when a component or token already exists. Wrapper components
in `src/frontend/ui/components` abstract the design-system primitives so
upgrades happen in one place.

## Form Design Guidelines

When creating forms use the wrapper components so your inputs and buttons match
the rest of the UI. These guidelines help keep layouts consistent:

- Use `InputField` to pair labels with their controls. Provide the input
  component via the `as` prop and pass component props through `options`.
- `Button` and `InputField` wrap the design-system components so events and
  sizing tokens behave consistently.
- Group related fields using `FormGroup` to maintain spacing and a clear
  vertical rhythm.
- Arrange elements with the 12‑column grid classes (`cs*`/`ce*`) so forms remain
  responsive.
- Use values from `@mirohq/design-tokens` for margins and padding instead of
  hard‑coded numbers.
- Layout wrappers such as `Panel` or `Section` expose a `padding` prop. Pass a
  token from `@mirohq/design-tokens` so spacing stays consistent.
- Avoid passing custom `className` or `style` props to these wrappers; spacing
  decisions belong inside the component.
- Keep wrapper nesting shallow; avoid unnecessary layers.
- When customisation is needed prefer extending design-system tokens over
  creating bespoke CSS classes.
- Stick to the provided `Button` component and choose the `primary` variant for
  the main action. Place secondary actions on the right using the `buttons`
  wrapper as seen in the tabs.
- Keep labels short and descriptive. When extra context is required add a
  `Paragraph` element next to the fields.
- Use real heading tags with visible text so screen readers announce sections.
- For drag‑and‑drop zones include an ARIA label and hidden instructions so
  screen readers describe the workflow.

## ✅ Prerequisites <a name="prerequisites"></a>

- Node.js 20.x

## 🏃🏽‍♂️ Run the app locally <a name="run"></a>

1. Run `npm install` to install dependencies. The `package-lock.json` file
   ensures everyone installs the same versions.
2. Run `npm run dev` to start the development server. Your URL should be
   similar to this example:

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

Run the backend test suite:

```bash
npm test
```

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
npm run format --silent
```

The Husky hooks live under the repository's `.husky/` folder. Hooks are installed automatically on `npm install` via the `prepare` script so each commit is validated. The pre-commit hook runs type checking, tests, ESLint and Prettier. Execute the Vitest suite yourself before committing. Aim for at least 90 % line and branch coverage and keep cyclomatic complexity under eight (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)). Sonar rules such as using `readonly` class fields, optional chaining, semantic HTML tags and stable React keys. Run these checks before committing so code conforms to the repository guidelines.

CI merges coverage from all test shards. The build doesn't fail based on coverage
numbers, so developers must keep both codebases above 90 % coverage

With `package-lock.json` checked in you can run `npm audit` after each install
to scan dependencies for vulnerabilities. Include the lock file in commits so
everyone uses the exact dependency versions when installing.

## Logging

All runtime messages are emitted through a shared logger defined in
[`src/frontend/logger.ts`](src/frontend/logger.ts). Set the
`LOG_LEVEL` environment variable to `trace`, `debug`, `info`, `warn`, `error` or
`silent` to control verbosity. It defaults to `info`.

The Fastify server uses **Logfire** for structured logging. Client log entries
are posted to `/api/logs` so both sides share the same log stream. Background
workers reuse the Fastify logger (`app.log`) for consistent redaction and correlation.

Data persistence is handled by **Prisma**. Development and tests use SQLite
while production targets PostgreSQL through the same models. Database schemas
are maintained with Prisma migrations applied automatically before startup.

## Change queue, cache, and logging

API routes enqueue change tasks which a background worker applies using the Miro
REST API. A lightweight SQLite cache stores board snapshots so lookups through
`/api/cache/{board_id}` avoid redundant API calls.

`src/config/logger.ts` wires Logfire into Fastify and adds a request ID
context so every request is traceable end to end.

Several new C# utilities (`ExcelLoader`, `LayoutEngine`, `InMemoryTemplateStore` and
`ObjectMatcher`) are early prototypes. TODO markers outline the remaining work
to match the JavaScript implementations.

Example:

```bash
LOG_LEVEL=debug npm run dev
```

## Commit message checks

Commit messages must follow the Conventional Commits specification. A
`commit-msg` hook runs commitlint automatically (installed via `npm install`). Verify the latest commit
manually by running:

```bash
npm run commitlint -- --edit $(git rev-parse --verify HEAD)
```

The CI pipeline also enforces commitlint via
[`\.github/workflows/commitlint.yml`](.github/workflows/commitlint.yml).
All Node jobs run from the repository root so caching and dependency
installs share the same lockfile.

## 🗂️ Folder structure <a name="folder"></a>

```
.
├── docs/
├── src/
│   ├── config/
│   ├── routes/
│   └── frontend/
├── tests/
└── templates/
```

## 📚 Additional Design Docs

- [Architecture](docs/ARCHITECTURE.md) explains how the source modules are
  organised.
- [Tab Overview](docs/TABS.md) describes the sidebar tabs and their purpose.
- [Deployment Guide](docs/DEPLOYMENT.md) describes building and hosting the React client.
- [Node Backend Architecture](docs/node-architecture.md) explains Fastify setup and Miro integration.
- [Miro API Costs](docs/MIRO_API_COSTS.md) explains why we cache shapes and avoid expensive board calls.
- [Components Catalogue](docs/COMPONENTS.md) documents reusable React
  components.
- [Design Foundation](docs/FOUNDATION.md) explains tokens and theming rules.
- [Code Style](docs/CODE_STYLE.md) outlines formatting and naming rules.
- [UI Patterns](docs/PATTERNS.md) shows common layouts and best practices.
- [Excel Import](docs/EXCEL_IMPORT.md) details workbook loading and sync.

## Storybook

Run the component explorer to preview the UI library. Storybook exposes
interactive examples for each component and includes a toolbar toggle for the
design-system light and dark themes. Add stories for any new UI element so
reviewers can verify visuals.

```bash
npm run storybook
```

Generate a static Storybook site for publishing with:

```bash
npm run build-storybook
```

## Local CI Build

Run the helper script to reproduce the GitHub Actions pipeline locally. It
executes lint checks, type verification, unit tests, the production build and
the Storybook build in sequence. Semantic release is intentionally skipped.

Pull requests trigger the unified `ci.yml` workflow to run linting, type checks,
unit tests and production builds for the Node backend and the React
client. Pushes to `main` additionally invoke `repo-sonar.yml`, `repo-codeql.yml`
and `repo-release.yml` for coverage, static analysis and packaging tasks.

```bash
npm run ci:local
```

## Changelog

Release notes are generated by
[semantic-release](https://github.com/semantic-release/semantic-release) and
appended to `CHANGELOG.md` in the repository root. Manual updates are no longer
required.

## 🫱🏻‍🫲🏽 Contributing <a name="contributing"></a>

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and
the development workflow.

## 🪪 License <a name="license"></a>

This software is released into the public domain under [The Unlicense](LICENSE).
See the LICENSE file for details.

### Database (Prisma)

- Import your Prisma Client in backend code with:

```
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

This repo uses a singleton via `getPrisma()` in `src/config/db.ts`, which internally constructs the client once and reuses it.

- Generate client and apply migrations:

```
npm run migrate:dev      # development migrations
npm run migrate:deploy   # deploy existing migrations
```

Tip: For real-time database updates without polling, see Prisma Pulse: https://pris.ly/tip-0-pulse
