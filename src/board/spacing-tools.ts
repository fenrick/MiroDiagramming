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
 * chosen axis. Spacing is measured between the outer edges of each
 * widget so items with different dimensions maintain the same gap.
 * Item order is derived from their current position.
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
    (a, b) =>
      ((a as Record<string, number>)[axis] ?? 0) -
      ((b as Record<string, number>)[axis] ?? 0),
  );

  let position = (items[0] as Record<string, number>)[axis] ?? 0;
  await moveWidget(
    items[0] as Record<string, number> & { sync?: () => Promise<void> },
    axis,
    position,
  );

  for (let i = 1; i < items.length; i += 1) {
    const prev = items[i - 1] as Record<string, number>;
    const curr = items[i] as Record<string, number> & {
      sync?: () => Promise<void>;
    };
    const prevSize = getDimension(prev, sizeKey);
    const currSize = getDimension(curr, sizeKey);
    position += prevSize / 2 + opts.spacing + currSize / 2;
    await moveWidget(curr, axis, position);
  }
}

function getDimension(item: Record<string, number>, key: string): number {
  const val = item[key];
  return typeof val === 'number' ? val : 0;
}

async function moveWidget(
  item: Record<string, number> & { sync?: () => Promise<void> },
  axis: 'x' | 'y',
  position: number,
): Promise<void> {
  item[axis] = position;
  await item.sync?.();
}
