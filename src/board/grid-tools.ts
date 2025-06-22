/**
 * Calculate grid positions and apply a grid layout to the current selection.
 */
export interface GridOptions {
  /** Number of columns in the grid */
  cols: number;
  /** Gap between cells in pixels */
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

/**
 * Minimal abstraction of the board API used for selection and grouping.
 * Allows injection of a mock implementation in tests.
 */
import { BoardLike, getBoard } from './board';

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
  count: number,
  cellWidth: number,
  cellHeight: number,
): Position[] {
  const positions: Position[] = [];
  for (let i = 0; i < count; i += 1) {
    const c = i % opts.cols;
    const r = Math.floor(i / opts.cols);
    positions.push({
      x: c * (cellWidth + opts.padding),
      y: r * (cellHeight + opts.padding),
    });
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
  const b = getBoard(board);
  const selection = await b.getSelection();
  let items = selection;
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
  const positions = calculateGridPositions(
    opts,
    items.length,
    first.width,
    first.height,
  );
  await Promise.all(
    items.map(async (item: Record<string, unknown>, i: number) => {
      item.x = first.x + positions[i].x;
      item.y = first.y + positions[i].y;
      if (typeof (item as { sync?: () => Promise<void> }).sync === 'function') {
        await (item as { sync: () => Promise<void> }).sync();
      }
    }),
  );
  if (opts.groupResult && typeof b.group === 'function') {
    await b.group({ items });
  }
}
