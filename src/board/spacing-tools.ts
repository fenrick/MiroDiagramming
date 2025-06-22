import { BoardLike, getBoard } from './board';

/** Options for spacing layout. */
export interface SpacingOptions {
  /** Axis to distribute along: 'x' for horizontal or 'y' for vertical. */
  axis: 'x' | 'y';
  /** Distance between successive items in board units. */
  spacing: number;
}

/** Compute linear offsets for a given count and spacing. */
export function calculateSpacingOffsets(
  count: number,
  spacing: number,
): number[] {
  const offsets: number[] = [];
  for (let i = 0; i < count; i += 1) offsets.push(i * spacing);
  return offsets;
}

/**
 * Distribute the current selection so each item is spaced evenly on the
 * chosen axis. Item order is derived from their current position.
 */
export async function applySpacingLayout(
  opts: SpacingOptions,
  board?: BoardLike,
): Promise<void> {
  const b = getBoard(board);
  const selection = await b.getSelection();
  if (!selection.length) return;

  const axis = opts.axis;
  const items = [...selection].sort(
    (a, b) =>
      ((a as Record<string, number>)[axis] ?? 0) -
      ((b as Record<string, number>)[axis] ?? 0),
  );
  const start = (items[0] as Record<string, number>)[axis] ?? 0;
  const offsets = calculateSpacingOffsets(items.length, opts.spacing);
  await Promise.all(
    items.map(async (item, i) => {
      (item as Record<string, number>)[axis] = start + offsets[i];
      if (typeof (item as { sync?: () => Promise<void> }).sync === 'function') {
        await (item as { sync: () => Promise<void> }).sync();
      }
    }),
  );
}
