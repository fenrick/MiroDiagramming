/**
 * Helper functions for calculating spacing layouts.
 *
 * These utilities operate purely on dimensions and coordinates without
 * referencing the board API.
 */

/** Compute linear offsets for a given count and spacing. */
export function calculateSpacingOffsets(count: number, spacing: number): number[] {
  return Array.from({ length: count }, (_, i) => i * spacing)
}

/** Plan widget positions and size when distributing by growth. */
export function calculateGrowthPlan(
  items: Array<Record<string, number>>,
  axis: 'x' | 'y',
  spacing: number,
): { size: number; positions: number[] } {
  if (items.length === 0) {
    return { size: 0, positions: [] }
  }
  const sizeKey = axis === 'x' ? 'width' : 'height'
  const first = items[0]!
  const last = items[items.length - 1]!
  /* c8 ignore next */
  const startEdge = (first[axis] ?? 0) - getDimension(first, sizeKey) / 2
  /* c8 ignore next */
  const endEdge = (last[axis] ?? 0) + getDimension(last, sizeKey) / 2
  const total = endEdge - startEdge
  const size = (total - spacing * (items.length - 1)) / items.length
  const positions: number[] = []
  let pos = startEdge + size / 2
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of items) {
    positions.push(pos)
    pos += size + spacing
  }
  return { size, positions }
}

/**
 * Safely retrieve a numeric dimension from a widget-like object.
 *
 * @param item - Object containing dimension properties.
 * @param key - Dimension property name ('width' or 'height').
 * @returns The numeric dimension or `0` when unavailable.
 */
export function getDimension(item: Record<string, number>, key: string): number {
  const val = item[key]
  return typeof val === 'number' ? val : 0
}
