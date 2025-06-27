# Miro JSON Graph Diagram App

Miro JSON Graph Diagram App is a full diagramming toolbox for Miro. It began as
a simple JSON importer but now bundles extensive board utilities. Graphs and
cards can be loaded from JSON, arranged automatically via the **Eclipse Layout
Kernel**, and customised through reusable shape templates. Extra sidebar tabs
handle resizing, styling, grid layout, frames, exporting and even comment and
data‑binding workflows.

## Features

- Import graph or card data from JSON
- Template-based shapes and connector styles
- Automatic ELK layout with nested container support
- Utility tabs for resizing, styling and exporting widgets
- Grid placement and frame management helpers
- Template catalogue with flowcharts and other presets
- Export to PNG, SVG, BPMN or Markdown
- Live data bindings and comment threads

## Quick start

```bash
npm install
npm start
```

Open the app manifest editor in Miro, set `sdkUri` to `http://localhost:3000`
and install the app on your developer team.

## Development workflow

Run the checks below before committing:

```bash
npm run typecheck --silent
npm test --silent
npm run lint --silent
npm run prettier --silent
```

Documentation lives in the [`docs`](docs) folder and is also published to the
GitHub wiki for easy editing.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

Please report vulnerabilities privately via [SECURITY.md](SECURITY.md).

## License

Released under the [Unlicense](LICENSE).
