/**
 * Grid layout helper to compute item positions.
 *
 * @param count - Total number of items.
 * @param config - Grid settings including columns, padding and optional vertical order.
 * @param width - Width of each item.
 * @param height - Height of each item.
 * @returns Array of relative positions for each item.
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
