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
  cols: number
  padding: number
  vertical?: boolean
}

export interface GridPosition {
  x: number
  y: number
}

export function calculateGrid(
  count: number,
  config: GridConfig,
  width: number,
  height: number,
): GridPosition[] {
  const cols = Math.max(1, config.cols)
  return config.vertical
    ? computeColumnMajorPositions(count, cols, width, height, config.padding)
    : computeRowMajorPositions(count, cols, width, height, config.padding)
}

function computeRowMajorPositions(
  count: number,
  cols: number,
  width: number,
  height: number,
  padding: number,
): GridPosition[] {
  const positions: GridPosition[] = []
  for (let index = 0; index < count; index += 1) {
    const col = index % cols
    const row = Math.floor(index / cols)
    positions.push({ x: col * (width + padding), y: row * (height + padding) })
  }
  return positions
}

function computeColumnMajorPositions(
  count: number,
  cols: number,
  width: number,
  height: number,
  padding: number,
): GridPosition[] {
  const positions: GridPosition[] = []
  const base = Math.floor(count / cols)
  const extra = count % cols
  let cursor = 0
  for (let col = 0; col < cols; col += 1) {
    const size = base + (col < extra ? 1 : 0)
    for (let row = 0; row < size; row += 1) {
      if (cursor >= count) break
      positions[cursor] = { x: col * (width + padding), y: row * (height + padding) }
      cursor += 1
    }
  }
  return positions
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
  options: {
    cols: number
    padding: number
    sortOrientation?: 'horizontal' | 'vertical'
  },
  count: number,
  cellWidth: number,
  cellHeight: number,
): GridPosition[] {
  const config: GridConfig = {
    cols: options.cols,
    padding: options.padding,
    vertical: options.sortOrientation === 'vertical',
  }
  return calculateGrid(count, config, cellWidth, cellHeight)
}
