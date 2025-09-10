/** Known algorithms for nested graph layouts. */
export const NESTED_ALGORITHMS = ['box', 'rectstacking'] as const

/** Valid nested graph algorithm names. */
export type NestedAlgorithm = (typeof NESTED_ALGORITHMS)[number]

/**
 * Check if a string refers to a supported nested layout algorithm.
 */
export function isNestedAlgorithm(alg?: string | null): alg is NestedAlgorithm {
  return alg === 'box' || alg === 'rectstacking'
}
