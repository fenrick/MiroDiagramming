/**
 * Spacing utilities operating on board selection.
 *
 * Located in `src/board` alongside other widget manipulation helpers.
 */
import * as log from '../logger'

import { type BoardLike, getBoard, maybeSync, type Syncable } from './board'
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
export async function applySpacingLayout(
  options: SpacingOptions,
  board?: BoardLike,
): Promise<void> {
  const b = getBoard(board)
  log.info('Applying spacing layout')
  const selection = await boardCache.getSelection(b)
  if (selection.length === 0) {
    return
  }

  const axis = options.axis
  const sizeKey = axis === 'x' ? 'width' : 'height'
  const items = [...selection].toSorted(
    /* c8 ignore next */
    (a, b) => {
      const ax = axis === 'x' ? ((a as { x?: number }).x ?? 0) : ((a as { y?: number }).y ?? 0)
      const bx = axis === 'x' ? ((b as { x?: number }).x ?? 0) : ((b as { y?: number }).y ?? 0)
      return ax - bx
    },
  ) as Array<Record<string, number> & Syncable>
  const mode = options.mode ?? 'move'
  if (mode === 'grow') {
    const plan = calculateGrowthPlan(items, axis, options.spacing)
    await Promise.all(
      items.map(async (item, index) => {
        if (sizeKey === 'width') {
          ;(item as { width?: number }).width = plan.size
        } else {
          ;(item as { height?: number }).height = plan.size
        }
        const pos = plan.positions.at(index) ?? 0
        if (axis === 'x') {
          ;(item as { x?: number }).x = pos
        } else {
          ;(item as { y?: number }).y = pos
        }
        await maybeSync(item)
      }),
    )
    return
  }
  const first = items[0]!
  let position = axis === 'x' ? (first.x ?? 0) : (first.y ?? 0)
  await moveWidget(first, axis, position)

  let previous: Record<string, number> & Syncable = first
  for (const current of items.slice(1)) {
    const previousSize = getDimension(previous, sizeKey)
    const currentSize = getDimension(current, sizeKey)
    position += previousSize / 2 + options.spacing + currentSize / 2
    await moveWidget(current, axis, position)
    previous = current
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
  if (axis === 'x') {
    ;(item as { x?: number }).x = position
  } else {
    ;(item as { y?: number }).y = position
  }
  await maybeSync(item)
}
