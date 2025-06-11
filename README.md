# Miro Structured Graph Generator

The **Miro Structured Graph Generator** plugin demonstrates how to import structured graph data in JSON format, lay it out with the [ELK](https://www.eclipse.org/elk/) layout engine, and render the result directly to a Miro board. It is built with [Preact](https://preactjs.com/) and TypeScript and can serve as a starting point for your own Miro app development.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 LTS is recommended)
- [Yarn](https://yarnpkg.com/) (v4 is used in this project)

## Installation

Install all dependencies using Yarn:

```bash
yarn install
```

## Development

Start a local development server with hot reload:

```bash
yarn start
```

This runs `preact watch` and serves the app on <http://localhost:3000>.

## Testing

Run the Jest test suite:

```bash
yarn test
```

## Using the Plugin

1. **Import JSON** – Provide a JSON file describing nodes and edges of your graph. The plugin parses the file and creates corresponding widgets in memory.
2. **Run ELK layout** – The imported graph is passed through the ELK layout engine which calculates positions for all nodes and connectors.
3. **Render to Miro** – After layout, widgets are created on the current Miro board and positioned based on the ELK output.

## Build and Deploy

To produce a production build run:

```bash
yarn build
```

The generated files will appear in the `dist` directory. Host these files on a static server and configure the URL in your Miro app settings to deploy the plugin.

## Manifest

The plugin manifest resides at `public/manifest.json`. Adjust the fields such as
`name`, `permissions`, or `icon` when registering the application in your Miro
developer dashboard.
