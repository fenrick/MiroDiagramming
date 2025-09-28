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
  const positions: GridPosition[] = []
  const cols = Math.max(1, config.cols)

  if (!config.vertical) {
    // Row-major (horizontal) fill: left → right across rows, then wrap
    for (let index = 0; index < count; index += 1) {
      const col = index % cols
      const row = Math.floor(index / cols)
      positions.push({
        x: col * (width + config.padding),
        y: row * (height + config.padding),
      })
    }
    return positions
  }

  // Column-major (vertical) fill that still respects the requested column count.
  // Distribute items across exactly `cols` columns: the first `extra` columns get one more item.
  const base = Math.floor(count / cols)
  const extra = count % cols
  const colSizes = Array.from({ length: cols }, (_, c) => base + (c < extra ? 1 : 0))
  const colStarts: number[] = []
  let start = 0
  for (let c = 0; c < cols; c += 1) {
    colStarts[c] = start
    start += colSizes[c]!
  }

  for (let index = 0; index < count; index += 1) {
    // Find the column that contains index i based on the distribution above
    let col = 0
    for (let c = 0; c < cols; c += 1) {
      const s = colStarts[c]!
      const e = s + colSizes[c]!
      if (index >= s && index < e) {
        col = c
        break
      }
    }
    const row = index - colStarts[col]!
    positions.push({
      x: col * (width + config.padding),
      y: row * (height + config.padding),
    })
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
