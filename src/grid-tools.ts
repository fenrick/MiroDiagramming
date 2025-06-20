/**
 * Calculate grid positions and apply a grid layout to the current selection.
 */
export interface GridOptions {
  cols: number;
  rows: number;
  padding: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface BoardLike {
  selection: {
    get(): Promise<Array<Record<string, unknown>>>;
  };
}

/**
 * Compute the relative offsets for each grid cell.
 */
export function calculateGridPositions(
  opts: GridOptions,
  cellWidth: number,
  cellHeight: number,
): Position[] {
  const positions: Position[] = [];
  for (let r = 0; r < opts.rows; r += 1) {
    for (let c = 0; c < opts.cols; c += 1) {
      positions.push({
        x: c * (cellWidth + opts.padding),
        y: r * (cellHeight + opts.padding),
      });
    }
  }
  return positions;
}

/**
 * Arrange selected widgets into a grid starting from the first widget's
 * position.
 */
export async function applyGridLayout(
  opts: GridOptions,
  board?: BoardLike,
): Promise<void> {
  const b =
    board ??
    (globalThis as unknown as { miro?: { board?: BoardLike } }).miro?.board;
  if (!b) throw new Error('Miro board not available');
  const selection = await b.selection.get();
  const items = selection.slice(0, opts.cols * opts.rows);
  if (!items.length) return;
  const first = items[0] as {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  const positions = calculateGridPositions(opts, first.width, first.height);
  await Promise.all(
    items.map(async (item: Record<string, unknown>, i: number) => {
      item.x = first.x + positions[i].x;
      item.y = first.y + positions[i].y;
      const sync = (item as { sync?: () => Promise<void> }).sync;
      if (typeof sync === 'function') {
        await sync();
      }
    }),
  );
}
