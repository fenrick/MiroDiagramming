export const NESTED_ALGORITHMS = ['box', 'rectstacking'] as const;
export type NestedAlgorithm = (typeof NESTED_ALGORITHMS)[number];

export function isNestedAlgorithm(alg?: string | null): alg is NestedAlgorithm {
  return alg === 'box' || alg === 'rectstacking';
}
