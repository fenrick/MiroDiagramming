/**
 * Pure grid layout utilities used by board tools.
 *
 * Resides in `src/board` alongside functions that manipulate widgets.
 */

/**
 * Grid layout helper for board items.
 *
 * Calculates relative cell coordinates for an item grid.
 *
 * @param count - Number of items to position.
 * @param config - Grid settings with column count, cell padding and optional
 * vertical ordering flag.
 * @param width - Width of each item.
 * @param height - Height of each item.
 * @returns Array of cell positions relative to the first item.
 */
export interface GridConfig {
  cols: number;
  padding: number;
  vertical?: boolean;
}

export interface GridPosition {
  x: number;
  y: number;
}

export function calculateGrid(
  count: number,
  config: GridConfig,
  width: number,
  height: number,
): GridPosition[] {
  const positions: GridPosition[] = [];
  const cols = Math.max(1, config.cols);
  const rows = Math.ceil(count / cols);
  for (let i = 0; i < count; i += 1) {
    const col = config.vertical ? Math.floor(i / rows) : i % cols;
    const row = config.vertical ? i % rows : Math.floor(i / cols);
    positions.push({
      x: col * (width + config.padding),
      y: row * (height + config.padding),
    });
  }
  return positions;
}

/**
 * Convenience wrapper building a grid configuration from {@link GridOptions}.
 *
 * @param opts - Layout options controlling columns and padding.
 * @param count - Number of items to position.
 * @param cellWidth - Width of each grid cell.
 * @param cellHeight - Height of each grid cell.
 */
export function calculateGridPositions(
  opts: {
    cols: number;
    padding: number;
    sortOrientation?: "horizontal" | "vertical";
  },
  count: number,
  cellWidth: number,
  cellHeight: number,
): GridPosition[] {
  const config: GridConfig = {
    cols: opts.cols,
    padding: opts.padding,
    vertical: opts.sortOrientation === "vertical",
  };
  return calculateGrid(count, config, cellWidth, cellHeight);
}
