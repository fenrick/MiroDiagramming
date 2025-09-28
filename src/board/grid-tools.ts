import * as log from '../logger'
import { getTextFields } from '../core/utils/text-utilities'

import { type BoardLike, getBoard, maybeSync, type Syncable } from './board'
import { boardCache } from './board-cache'
import { calculateGridPositions } from './grid-layout'

/**
 * Grid layout helpers for arranging selected widgets.
 *
 * Lives in `src/board` with other board manipulation utilities.
 */
export interface GridOptions {
  /** Number of columns in the grid */
  cols: number
  /** Gap between cells in pixels */
  padding: number
  /** Whether to group the widgets after layout. */
  groupResult?: boolean
  /** Optional frame title when grouping into a frame. */
  frameTitle?: string
  /** Sort widgets alphabetically by their name before layout. */
  sortByName?: boolean
  /** Direction for placing sorted items, defaults to horizontal */
  sortOrientation?: 'horizontal' | 'vertical'
}

/** Extract a name field from a widget for sorting purposes. */
function getName(item: Record<string, unknown>): string {
  const first = getTextFields(item)[0]
  return first ? first[1] : ''
}

/**
 * Arrange selected widgets into a grid starting from the first widget's
 * position. Widgets can optionally be sorted alphabetically and grouped
 * together after layout so they remain fixed in relation to each other.
 */
export async function applyGridLayout(options: GridOptions, board?: BoardLike): Promise<void> {
  const b = getBoard(board)
  log.info('Applying grid layout')
  const selection = await boardCache.getSelection(b)
  let items = options.sortByName
    ? [...selection].toSorted((a, b) => getName(a).localeCompare(getName(b)))
    : selection
  items = items.filter(
    (index) =>
      typeof (index as { width?: number }).width === 'number' &&
      typeof (index as { height?: number }).height === 'number' &&
      typeof (index as { x?: number }).x === 'number' &&
      typeof (index as { y?: number }).y === 'number',
  )
  if (items.length === 0) {
    return
  }
  const first = items[0] as {
    x: number
    y: number
    width: number
    height: number
  }
  const positions = calculateGridPositions(options, items.length, first.width, first.height)
  await Promise.all(
    items.map(async (item: Record<string, unknown>, index: number) => {
      const pos = positions.at(index)!
      item.x = first.x + pos.x
      item.y = first.y + pos.y
      await maybeSync(item as Syncable)
    }),
  )
  if (options.groupResult) {
    try {
      // Compute a bounding frame and add items to it
      const boxes = items.map((index) => {
        const x = (index as { x: number }).x
        const y = (index as { y: number }).y
        const w = (index as { width: number }).width
        const h = (index as { height: number }).height
        const left = x - w / 2
        const top = y - h / 2
        const right = x + w / 2
        const bottom = y + h / 2
        return { left, top, right, bottom }
      })
      const left = Math.min(...boxes.map((b) => b.left))
      const top = Math.min(...boxes.map((b) => b.top))
      const right = Math.max(...boxes.map((b) => b.right))
      const bottom = Math.max(...boxes.map((b) => b.bottom))
      const pad = Math.max(20, Math.min(options.padding * 2, 80))
      const width = right - left + pad * 2
      const height = bottom - top + pad * 2
      const cx = left + (right - left) / 2
      const cy = top + (bottom - top) / 2

      const { BoardBuilder } = await import('./board-builder')
      const builder = new BoardBuilder()
      const frame = await builder.createFrame(width, height, cx, cy, options.frameTitle)
      // Best-effort add; ignore if API is not available in types
      await Promise.all(
        items.map(async (index) => {
          try {
            // @ts-expect-error runtime API
            await frame.add?.(index)
          } catch {
            // ignore best-effort add failures
          }
        }),
      )
    } catch {
      log.warning('Failed to create frame for arranged items; falling back to group if available')
      if (typeof b.group === 'function') {
        await b.group({ items })
      }
    }
  }
  log.debug({ count: items.length }, 'Grid layout complete')
}
