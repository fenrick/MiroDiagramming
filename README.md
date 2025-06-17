# Miro JSON Graph Diagram App

This project demonstrates how to import a JSON description of a graph and build a diagram on a Miro board. The application uses the **Eclipse Layout Kernel (ELK)** to arrange nodes and edges automatically. Shapes are generated from templates and each element can carry metadata that controls its appearance and placement.

## Uploading JSON Graphs

1. Click the app icon on your Miro board.
2. Select a `.json` file containing `nodes` and `edges`.
3. After the file uploads the ELK layout engine positions the elements and the board is populated with the resulting shapes.

## ELK Layout

The layout step leverages the ELK algorithm to compute positions for all nodes. You can provide layout hints in each node's metadata to influence spacing or layering. The engine runs automatically when a graph is uploaded.

## Template‑Based Shapes

Shape templates live in [`templates/shapeTemplates.json`](templates/shapeTemplates.json). Each template defines the shape type, size and base styles. When a node specifies a `template` value in its metadata the corresponding template is applied. Edit this file or add new entries to customize the available shapes. Connector appearance is configured in [`templates/connectorTemplates.json`](templates/connectorTemplates.json) which controls line color, caps and font.

## Metadata Usage

Nodes may include a `metadata` object with any additional information. Typical fields are:

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

A small example is provided in [sample-graph.json](sample-graph.json):

```json
{
  "nodes": [
    { "id": "n1", "label": "Customer", "type": "Role" },
    { "id": "n2", "label": "Service", "type": "BusinessService" }
  ],
  "edges": [{ "from": "n1", "to": "n2", "label": "uses" }]
}
```

## Setup

- [Miro Web SDK](https://developers.miro.com/docs/web-sdk-reference)
  - [miro.board.ui.openPanel()](https://developers.miro.com/docs/ui_boardui#openpanel)

## 🛠️ Tools and Technologies <a name="tools"></a>

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)

## ✅ Prerequisites <a name="prerequisites"></a>

- You have a [Miro account](https://miro.com/signup/).
- You're [signed in to Miro](https://miro.com/login/).
- Your Miro account has a [Developer team](https://developers.miro.com/docs/create-a-developer-team).
- Your development environment includes [Node.js 14.13](https://nodejs.org/en/download) or a later version.
- All examples use `npm` as a package manager and `npx` as a package runner.

## 📖 Associated Developer Tutorial <a name="tutorial"></a>

See the Miro documentation for details on building diagramming apps.

## 🏃🏽‍♂️ Run the app locally <a name="run"></a>

1. Run `npm install` to install dependencies.
2. Run `npm start` to start developing. \
   Your URL should be similar to this example:

```
 http://localhost:3000
```

3. Start the development server:
   ```bash
   npm start
   ```
4. Open the [app manifest editor](https://developers.miro.com/docs/manually-create-an-app#step-2-configure-your-app-in-miro) by clicking **Edit in Manifest**. \
   In the app manifest editor, configure the app as follows, and then click save:

```yaml
# See https://developers.miro.com/docs/app-manifest on how to use this
appName: JSON Diagram
sdkVersion: SDK_V2
sdkUri: http://localhost:3000
scopes:
  - boards:read
  - boards:write
```

4. Go back to your app home page, and under the `Permissions` section, you will see a blue button that says `Install app and get OAuth token`. Click that button. Then click on `Add` as shown in the video below. <b>In the video we install a different app, but the process is the same regardless of the app.</b>

> ⚠️ We recommend to install your app on a [developer team](https://developers.miro.com/docs/create-a-developer-team) while you are developing or testing apps.⚠️

https://github.com/miroapp/app-examples/assets/10428517/1e6862de-8617-46ef-b265-97ff1cbfe8bf

5. Go to your developer team, and open your boards.
6. Click on the plus icon from the bottom section of your left sidebar. If you hover over it, it will say `More apps`.
7. Search for your app `JSON Diagram` or whatever you chose to name it. Click on your app to use it, as shown in the video below. <b>In the video we search for a different app, but the process is the same regardless of the app.</b>

https://github.com/horeaporutiu/app-examples-template/assets/10428517/b23d9c4c-e785-43f9-a72e-fa5d82c7b019

## Testing

To validate the codebase run:

```bash
npm run typecheck
npm test
npm run lint
```

These commands perform TypeScript type checking and execute a small Jest suite.

## 🗂️ Folder structure <a name="folder"></a>

```
.
├── src
│  ├── assets
│  │  └── style.css
│  ├── app.tsx     // The code for the app lives here
│  ├── index.ts    // The code for the app entry point lives here
│  └── graph.ts    // JSON graph loading helpers
├── app.html       // The app itself. It's loaded on the board inside the 'appContainer'
└── index.html     // The app entry point. This is what you specify in the 'App URL' box in the Miro app settings
```

## 🫱🏻‍🫲🏽 Contributing <a name="contributing"></a>

If you want to contribute to this example, or any other Miro Open Source project, please review [Miro's contributing guide](https://github.com/miroapp/app-examples/blob/main/CONTRIBUTING.md).

## 🪪 License <a name="license"></a>

After starting the server open your Miro board and run the app to upload JSON graphs and automatically create diagrams.
