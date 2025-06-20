/**
 * Calculate grid positions and apply a grid layout to the current selection.
 */
export interface GridOptions {
  cols: number;
  rows: number;
  padding: number;
  /** Whether to group the widgets after layout. */
  groupResult?: boolean;
  /** Sort widgets alphabetically by their name before layout. */
  sortByName?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface BoardLike {
  selection: {
    get(): Promise<Array<Record<string, unknown>>>;
  };
  group?: (opts: { items: Array<Record<string, unknown>> }) => Promise<unknown>;
}

/** Extract a name field from a widget for sorting purposes. */
function getName(item: Record<string, unknown>): string {
  return String(
    (item as { title?: string }).title ??
      (item as { plainText?: string }).plainText ??
      (item as { content?: string }).content ??
      (item as { text?: string }).text ??
      '',
  );
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
 * position. Widgets can optionally be sorted alphabetically and grouped
 * together after layout so they remain fixed in relation to each other.
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
  let items = selection.slice(0, opts.cols * opts.rows);
  if (opts.sortByName) {
    items = [...items].sort((a, b) => getName(a).localeCompare(getName(b)));
  }
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
  if (opts.groupResult && typeof b.group === 'function') {
    await b.group({ items });
  }
}
