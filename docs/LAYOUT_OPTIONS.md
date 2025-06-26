# Layout Options

The diagramming add-on uses the Eclipse Layout Kernel (ELK) to position nodes
and edges. This document summarises the algorithms available via the Diagram
tab.

| Algorithm      | Purpose                                                           |
| -------------- | ----------------------------------------------------------------- |
| `mrtree`       | Arranges hierarchical data with multiple roots as a compact tree. |
| `layered`      | Traditional Sugiyama-style layered layout for directed graphs.    |
| `force`        | Force-directed layout that spreads nodes organically.             |
| `rectpacking`  | Packs child nodes into parent containers for nested diagrams.     |
| `rectstacking` | Stacks rectangles into rows or columns, useful for swimlanes.     |
| `box`          | Simple box layout placing items in a uniform grid.                |
| `radial`       | Positions nodes on concentric circles around a centre node.       |

The quick choices in the Diagram tab map to these algorithms:

- **Layered** – uses `layered`.
- **Tree** – uses `mrtree`.
- **Grid** – uses `force`.
- **Nested** – uses `rectpacking` with automatic container sizing.

See [TEMPLATES.md](TEMPLATES.md#3-sample-data) for a nested layout example.

## Common options

- **Direction** – `DOWN`, `UP`, `LEFT` or `RIGHT`.
- **Spacing** – pixel distance between nodes.
- **Aspect ratio** – preferred width/height ratio.

### Algorithm specific options

| Algorithm     | Options                                                                       |
| ------------- | ----------------------------------------------------------------------------- |
| `layered`     | `edgeRouting` – `ORTHOGONAL`, `POLYLINE`, `SPLINES`                           |
| `mrtree`      | `edgeRoutingMode` – `NONE`, `MIDDLE_TO_MIDDLE`, `AVOID_OVERLAP`               |
| `rectpacking` | `optimizationGoal` – `MAX_SCALE_DRIVEN`, `ASPECT_RATIO_DRIVEN`, `AREA_DRIVEN` |
