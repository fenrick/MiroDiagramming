# Miro JSON Graph Diagram App

This project demonstrates how to import a JSON description of a graph and build a diagram on a Miro board. The application uses the **Eclipse Layout Kernel (ELK)** to arrange nodes and edges automatically. Shapes are generated from templates and each element can carry metadata that controls its appearance and placement.

## Uploading JSON Graphs

1. Click the app icon on your Miro board.
2. Select a `.json` file containing `nodes` and `edges`.
3. After the file uploads the ELK layout engine positions the elements and the board is populated with the resulting shapes.

## ELK Layout

The layout step leverages the ELK algorithm to compute positions for all nodes. You can provide layout hints in each node's metadata to influence spacing or layering. The engine runs automatically when a graph is uploaded.

## Template‑Based Shapes

Shape templates live in [`templates/shapeTemplates.json`](templates/shapeTemplates.json). Each template defines the shape type, colors, and size. When a node specifies a `template` value in its metadata the corresponding template is applied. Edit this file or add new entries to customize the available shapes.

## Metadata Usage

Nodes may include a `metadata` object with any additional information. Typical fields are:

- `template`: name of the shape template to use.
- `label`: text displayed on the shape.
- `elk`: optional layout properties passed directly to the ELK engine.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Load or update shape templates in `templates/shapeTemplates.json` and refresh the app if changes are made.

After starting the server open your Miro board and run the app to upload JSON graphs and automatically create diagrams.
