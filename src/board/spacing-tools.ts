import { BoardLike, getBoard, maybeSync, Syncable } from './board';
import { calculateGrowthPlan, getDimension } from './spacing-layout';

/** Options for spacing layout. */
export interface SpacingOptions {
  /** Axis to distribute along: 'x' for horizontal or 'y' for vertical. */
  axis: 'x' | 'y';
  /** Distance between successive items in board units. */
  spacing: number;
  /**
   * Layout mode:
   * - `move` keeps widget sizes and changes positions.
   * - `grow` expands all widgets equally so outer edges remain fixed.
   */
  mode?: 'move' | 'grow';
}

/**
 * Distribute the current selection so each item is spaced evenly on the
 * chosen axis. Spacing is measured between the outer edges of each
 * widget so items with different dimensions maintain the same gap.
 * Item order is derived from their current position. Every widget is
 * synchronised immediately after its coordinates are updated so the
 * board reflects the new layout.
 */
export async function applySpacingLayout(
  opts: SpacingOptions,
  board?: BoardLike,
): Promise<void> {
  const b = getBoard(board);
  const selection = await b.getSelection();
  if (!selection.length) return;

  const axis = opts.axis;
  const sizeKey = axis === 'x' ? 'width' : 'height';
  const items = [...selection].sort(
    /* c8 ignore next */
    (a, b) =>
      ((a as Record<string, number>)[axis] ?? 0) -
      ((b as Record<string, number>)[axis] ?? 0),
  ) as Array<Record<string, number> & Syncable>;
  const mode = opts.mode ?? 'move';
  if (mode === 'grow') {
    const plan = calculateGrowthPlan(items, axis, opts.spacing);
    await Promise.all(
      items.map(async (item, i) => {
        item[sizeKey] = plan.size;
        item[axis] = plan.positions[i];
        await maybeSync(item);
      }),
    );
    return;
  }

  let position = items[0][axis] ?? 0;
  await moveWidget(items[0], axis, position);

  let prev = items[0];
  for (const curr of items.slice(1)) {
    const prevSize = getDimension(prev, sizeKey);
    const currSize = getDimension(curr, sizeKey);
    position += prevSize / 2 + opts.spacing + currSize / 2;
    await moveWidget(curr, axis, position);
    prev = curr;
  }
}

/**
 * Move a widget along one axis and sync it with the board.
 *
 * @param item - The widget to update.
 * @param axis - Axis to modify ('x' or 'y').
 * @param position - New coordinate value.
 */
async function moveWidget(
  item: Record<string, number> & Syncable,
  axis: 'x' | 'y',
  position: number,
): Promise<void> {
  item[axis] = position;
  await maybeSync(item);
}
