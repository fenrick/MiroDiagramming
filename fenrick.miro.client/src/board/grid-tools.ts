/**
 * Grid layout helpers for arranging selected widgets.
 *
 * Lives in `src/board` with other board manipulation utilities.
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
  /** Direction for placing sorted items, defaults to horizontal */
  sortOrientation?: 'horizontal' | 'vertical';
}

import { log } from '../logger';
/**
 * Minimal abstraction of the board API used for selection and grouping.
 * Allows injection of a mock implementation in tests.
 */
import { BoardLike, getBoard, maybeSync, Syncable } from './board';
import { boardCache } from './board-cache';
import { calculateGridPositions } from './grid-layout';
import { getTextFields } from './search-tools';

/** Extract a name field from a widget for sorting purposes. */
function getName(item: Record<string, unknown>): string {
  const first = getTextFields(item)[0];
  return first ? first[1] : '';
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
  log.info('Applying grid layout');
  const selection = await boardCache.getSelection(b);
  let items = opts.sortByName
    ? [...selection].sort((a, b) => getName(a).localeCompare(getName(b)))
    : selection;
  items = items.filter(
    i =>
      typeof (i as { width?: number }).width === 'number' &&
      typeof (i as { height?: number }).height === 'number' &&
      typeof (i as { x?: number }).x === 'number' &&
      typeof (i as { y?: number }).y === 'number',
  );
  if (!items.length) {
    return;
  }
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
      await maybeSync(item as Syncable);
    }),
  );
  if (opts.groupResult && typeof b.group === 'function') {
    log.debug('Grouping laid out items');
    await b.group({ items });
  }
  log.debug({ count: items.length }, 'Grid layout complete');
}
