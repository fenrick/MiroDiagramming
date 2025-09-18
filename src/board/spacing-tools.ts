/**
 * Spacing utilities operating on board selection.
 *
 * Located in `src/board` alongside other widget manipulation helpers.
 */
import * as log from '../logger'

import { BoardLike, getBoard, maybeSync, Syncable } from './board'
import { boardCache } from './board-cache'
import { calculateGrowthPlan, getDimension } from './spacing-layout'

/** Options for spacing layout. */
export interface SpacingOptions {
  /** Axis to distribute along: 'x' for horizontal or 'y' for vertical. */
  axis: 'x' | 'y'
  /** Distance between successive items in board units. */
  spacing: number
  /**
   * Layout mode:
   * - `move` keeps widget sizes and changes positions.
   * - `grow` expands all widgets equally so outer edges remain fixed.
   */
  mode?: 'move' | 'grow'
}

/**
 * Distribute the current selection so each item is spaced evenly on the
 * chosen axis. Spacing is measured between the outer edges of each
 * widget so items with different dimensions maintain the same gap.
 * Item order is derived from their current position. Every widget is
 * synchronised immediately after its coordinates are updated so the
 * board reflects the new layout.
 */
export async function applySpacingLayout(opts: SpacingOptions, board?: BoardLike): Promise<void> {
  const b = getBoard(board)
  log.info('Applying spacing layout')
  const selection = await boardCache.getSelection(b)
  if (!selection.length) {
    return
  }

  const axis = opts.axis
  const sizeKey = axis === 'x' ? 'width' : 'height'
  const items = [...selection].sort(
    /* c8 ignore next */
    (a, b) =>
      ((a as Record<string, number>)[axis] ?? 0) - ((b as Record<string, number>)[axis] ?? 0),
  ) as Array<Record<string, number> & Syncable>
  const mode = opts.mode ?? 'move'
  if (mode === 'grow') {
    const plan = calculateGrowthPlan(items, axis, opts.spacing)
    await Promise.all(
      items.map(async (item, i) => {
        item[sizeKey] = plan.size
        item[axis] = plan.positions[i]!
        await maybeSync(item)
      }),
    )
    return
  }
  const first = items[0]!
  let position = first[axis] ?? 0
  await moveWidget(first, axis, position)

  let prev: Record<string, number> & Syncable = first
  for (const curr of items.slice(1)) {
    const prevSize = getDimension(prev, sizeKey)
    const currSize = getDimension(curr, sizeKey)
    position += prevSize / 2 + opts.spacing + currSize / 2
    await moveWidget(curr, axis, position)
    prev = curr
  }
  log.debug({ count: items.length }, 'Spacing layout complete')
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
  item[axis] = position
  await maybeSync(item)
}
