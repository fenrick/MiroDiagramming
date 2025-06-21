export const ALGORITHMS = ['mrtree', 'layered', 'force'] as const;
export type ElkAlgorithm = (typeof ALGORITHMS)[number];

export const DIRECTIONS = ['DOWN', 'UP', 'LEFT', 'RIGHT'] as const;
export type ElkDirection = (typeof DIRECTIONS)[number];

/**
 * User configurable layout options with constrained values.
 */
export interface UserLayoutOptions {
  /** Layout algorithm used by ELK. */
  algorithm: ElkAlgorithm;
  /** Primary direction of the layout. */
  direction: ElkDirection;
  /** Spacing in pixels between nodes and layers. */
  spacing: number;
}

/** Default layout options applied when none are provided. */
export const DEFAULT_LAYOUT_OPTIONS: UserLayoutOptions = {
  algorithm: 'mrtree',
  direction: 'DOWN',
  spacing: 90,
};

/**
 * Validate partial user options and fall back to defaults for invalid values.
 *
 * @param opts - Partial options provided by the user.
 * @returns Complete options with invalid values replaced by defaults.
 */
export function validateLayoutOptions(
  opts: Partial<UserLayoutOptions>,
): UserLayoutOptions {
  const algorithm = ALGORITHMS.includes(opts.algorithm as ElkAlgorithm)
    ? (opts.algorithm as ElkAlgorithm)
    : DEFAULT_LAYOUT_OPTIONS.algorithm;
  const direction = DIRECTIONS.includes(opts.direction as ElkDirection)
    ? (opts.direction as ElkDirection)
    : DEFAULT_LAYOUT_OPTIONS.direction;
  const spacing =
    typeof opts.spacing === 'number' && opts.spacing > 0
      ? opts.spacing
      : DEFAULT_LAYOUT_OPTIONS.spacing;
  return { algorithm, direction, spacing };
}
