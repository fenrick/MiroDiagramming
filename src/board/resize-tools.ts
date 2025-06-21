/**
 * Utility functions to copy a widget size from the current selection and
 * apply it to other selected widgets.
 *
 * The board parameter defaults to the global `miro.board` when available so
 * the functions may be used both inside the app and in tests with a mock
 * board implementation.
 */
export interface Size {
  width: number;
  height: number;
}

import { BoardLike, getBoard } from './board';

/**
 * Retrieve the width and height of the first selected widget.
 *
 * @param board - Optional board API overriding `miro.board` for testing.
 * @returns The size of the first widget or `null` when unavailable.
 */
export async function copySizeFromSelection(
  board?: BoardLike,
): Promise<Size | null> {
  const b = getBoard(board);
  const selection = await b.getSelection();
  const first = selection[0] as { width?: number; height?: number } | undefined;
  if (
    !first ||
    typeof first.width !== 'number' ||
    typeof first.height !== 'number'
  ) {
    return null;
  }
  return { width: first.width, height: first.height };
}

/**
 * Resize all selected widgets to the provided size.
 *
 * @param size - Target width and height to apply.
 * @param board - Optional board API overriding `miro.board` for testing.
 */
export async function applySizeToSelection(
  size: Size,
  board?: BoardLike,
): Promise<void> {
  const b = getBoard(board);
  const selection = await b.getSelection();
  await Promise.all(
    selection.map(async (item: Record<string, unknown>) => {
      if (typeof item.width === 'number' && typeof item.height === 'number') {
        item.width = size.width;
        item.height = size.height;
        if (
          typeof (item as { sync?: () => Promise<void> }).sync === 'function'
        ) {
          await (item as { sync: () => Promise<void> }).sync();
        }
      }
    }),
  );
}
