/**
 * Helper functions for calculating spacing layouts.
 *
 * These utilities operate purely on dimensions and coordinates without
 * referencing the board API.
 */

/** Compute linear offsets for a given count and spacing. */
export function calculateSpacingOffsets(count: number, spacing: number): number[] {
  return Array.from({ length: count }, (_, index) => index * spacing)
}

/** Plan widget positions and size when distributing by growth. */
export function calculateGrowthPlan(
  items: Record<string, number>[],
  axis: 'x' | 'y',
  spacing: number,
): { size: number; positions: number[] } {
  if (items.length === 0) {
    return { size: 0, positions: [] }
  }
  const sizeKey: 'width' | 'height' = axis === 'x' ? 'width' : 'height'
  const first = items[0] as Record<string, number>
  const last = items.at(-1) as Record<string, number>
  /* c8 ignore next */
  const firstPos =
    axis === 'x' ? ((first as { x?: number }).x ?? 0) : ((first as { y?: number }).y ?? 0)
  /* c8 ignore next */
  const lastPos =
    axis === 'x' ? ((last as { x?: number }).x ?? 0) : ((last as { y?: number }).y ?? 0)
  const startEdge = firstPos - getDimension(first, sizeKey) / 2
  const endEdge = lastPos + getDimension(last, sizeKey) / 2
  const total = endEdge - startEdge
  const size = (total - spacing * (items.length - 1)) / items.length
  const positions = Array.from(
    { length: items.length },
    (_unused, index) => startEdge + size / 2 + index * (size + spacing),
  )
  return { size, positions }
}

/**
 * Safely retrieve a numeric dimension from a widget-like object.
 *
 * @param item - Object containing dimension properties.
 * @param key - Dimension property name ('width' or 'height').
 * @returns The numeric dimension or `0` when unavailable.
 */
export function getDimension(item: Record<string, number>, key: 'width' | 'height'): number {
  if (key === 'width') {
    const value = (item as { width?: number }).width
    return typeof value === 'number' ? value : 0
  }
  const value = (item as { height?: number }).height
  return typeof value === 'number' ? value : 0
}
