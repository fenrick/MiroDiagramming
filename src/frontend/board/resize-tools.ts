/**
 * Utility functions to copy a widget size from the current selection and
 * apply it to other selected widgets.
 *
 * The board parameter defaults to the global `miro.board` when available so
 * the functions may be used both inside the app and in tests with a mock
 * board implementation.
 */
export interface Size {
  width: number
  height: number
}

import { BoardLike, forEachSelection, getFirstSelection, maybeSync, Syncable } from './board'

/**
 * Retrieve the width and height of the first selected widget.
 *
 * @param board - Optional board API overriding `miro.board` for testing.
 * @returns The size of the first widget or `null` when unavailable.
 */
export async function copySizeFromSelection(board?: BoardLike): Promise<Size | null> {
  const first = (await getFirstSelection(board)) as { width?: number; height?: number } | undefined
  if (!first || typeof first.width !== 'number' || typeof first.height !== 'number') {
    return null
  }
  return { width: first.width, height: first.height }
}

/**
 * Resize all currently selected shapes.
 *
 * Only widgets exposing numeric `width` and `height` properties are
 * modified. Each widget is synchronised via its `.sync()` method when
 * available.
 *
 * @param size - Target width and height to apply.
 * @param board - Optional board API overriding `miro.board` for testing.
 */
export async function applySizeToSelection(size: Size, board?: BoardLike): Promise<void> {
  await forEachSelection(async (item: Record<string, unknown>) => {
    if (typeof item.width === 'number' && typeof item.height === 'number') {
      item.width = size.width
      item.height = size.height
      await maybeSync(item as Syncable)
    }
  }, board)
}

/**
 * Scale all currently selected widgets by a factor.
 *
 * Both the width and height of each widget are multiplied by the provided
 * factor. Widgets lacking numeric dimensions are ignored.
 *
 * @param factor - Scale multiplier to apply.
 * @param board - Optional board API overriding `miro.board` for testing.
 */
export async function scaleSelection(factor: number, board?: BoardLike): Promise<void> {
  await forEachSelection(async (item: Record<string, unknown>) => {
    const target = item as { width?: number; height?: number } & Syncable
    if (typeof target.width === 'number') {
      target.width *= factor
    }
    if (typeof target.height === 'number') {
      target.height *= factor
    }
    await maybeSync(target)
  }, board)
}
