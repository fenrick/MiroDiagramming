import { ASPECT_RATIO_IDS, type AspectRatioId } from '../utils/aspect-ratio'

/**
 * Supported ELK layout algorithms. Extend when enabling additional
 * algorithms in the layout engine.
 */
export const ALGORITHMS = [
  'mrtree',
  'layered',
  'force',
  'rectpacking',
  'rectstacking',
  'box',
  'radial',
] as const
export type ElkAlgorithm = (typeof ALGORITHMS)[number]

/** Allowed primary layout directions used by ELK. */
export const DIRECTIONS = ['DOWN', 'UP', 'LEFT', 'RIGHT'] as const
export type ElkDirection = (typeof DIRECTIONS)[number]

/** Supported edge routing styles for the layered algorithm. */
export const EDGE_ROUTINGS = ['ORTHOGONAL', 'POLYLINE', 'SPLINES'] as const
export type ElkEdgeRouting = (typeof EDGE_ROUTINGS)[number]

/** Routing modes used by MrTree. */
export const EDGE_ROUTING_MODES = ['NONE', 'MIDDLE_TO_MIDDLE', 'AVOID_OVERLAP'] as const
export type ElkEdgeRoutingMode = (typeof EDGE_ROUTING_MODES)[number]

/** Optimisation goals supported by RectPacking. */
export const OPTIMIZATION_GOALS = [
  'ASPECT_RATIO_DRIVEN',
  'MAX_SCALE_DRIVEN',
  'AREA_DRIVEN',
] as const
export type ElkOptimizationGoal = (typeof OPTIMIZATION_GOALS)[number]

/**
 * User configurable layout options with constrained values.
 */
export interface UserLayoutOptions {
  /** Layout algorithm used by ELK. */
  algorithm: ElkAlgorithm
  /** Primary direction of the layout. */
  direction: ElkDirection
  /** Spacing in pixels between nodes and layers. */
  spacing: number
  /** Preferred aspect ratio of the drawing. */
  aspectRatio: AspectRatioId
  /** Style of edge routing for layered layouts. */
  edgeRouting?: ElkEdgeRouting
  /** Routing mode used by MrTree. */
  edgeRoutingMode?: ElkEdgeRoutingMode
  /** Optimisation goal for rect packing. */
  optimizationGoal?: ElkOptimizationGoal
}

/** Default layout options applied when none are provided. */
export const ALGORITHM_DEFAULTS: Record<ElkAlgorithm, Omit<UserLayoutOptions, 'algorithm'>> = {
  mrtree: {
    direction: 'DOWN',
    spacing: 50,
    aspectRatio: 'golden',
    edgeRoutingMode: 'AVOID_OVERLAP',
  },
  layered: {
    direction: 'DOWN',
    spacing: 50,
    aspectRatio: 'golden',
    edgeRouting: 'ORTHOGONAL',
  },
  force: { direction: 'DOWN', spacing: 160, aspectRatio: '16:10' },
  rectpacking: {
    direction: 'DOWN',
    spacing: 15,
    aspectRatio: '4:3',
    optimizationGoal: 'MAX_SCALE_DRIVEN',
  },
  rectstacking: { direction: 'DOWN', spacing: 15, aspectRatio: 'golden' },
  box: { direction: 'DOWN', spacing: 15, aspectRatio: 'golden' },
  radial: { direction: 'RIGHT', spacing: 30, aspectRatio: 'golden' },
}

export const DEFAULT_LAYOUT_OPTIONS: UserLayoutOptions = {
  algorithm: 'mrtree',
  ...ALGORITHM_DEFAULTS.mrtree,
}

/**
 * Validate partial user options and fall back to defaults for invalid values.
 *
 * @param opts - Partial options provided by the user.
 * @returns Complete options with invalid values replaced by defaults.
 */
function validateEnum<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

export function validateLayoutOptions(options: Partial<UserLayoutOptions>): UserLayoutOptions {
  const algorithm = validateEnum(options.algorithm, ALGORITHMS, DEFAULT_LAYOUT_OPTIONS.algorithm)
  const defaults = ((): Omit<UserLayoutOptions, 'algorithm'> => {
    switch (algorithm) {
      case 'mrtree': {
        return ALGORITHM_DEFAULTS.mrtree
      }
      case 'layered': {
        return ALGORITHM_DEFAULTS.layered
      }
      case 'force': {
        return ALGORITHM_DEFAULTS.force
      }
      case 'rectpacking': {
        return ALGORITHM_DEFAULTS.rectpacking
      }
      case 'rectstacking': {
        return ALGORITHM_DEFAULTS.rectstacking
      }
      case 'box': {
        return ALGORITHM_DEFAULTS.box
      }
      case 'radial': {
        return ALGORITHM_DEFAULTS.radial
      }
      default: {
        return ALGORITHM_DEFAULTS.mrtree
      }
    }
  })()

  const direction = validateEnum(options.direction, DIRECTIONS, defaults.direction)
  const spacing =
    typeof options.spacing === 'number' && options.spacing > 0 ? options.spacing : defaults.spacing
  const aspectRatio = validateEnum(options.aspectRatio, ASPECT_RATIO_IDS, defaults.aspectRatio)

  const edgeRouting = defaults.edgeRouting
    ? validateEnum(options.edgeRouting, EDGE_ROUTINGS, defaults.edgeRouting)
    : undefined
  const edgeRoutingMode = defaults.edgeRoutingMode
    ? validateEnum(options.edgeRoutingMode, EDGE_ROUTING_MODES, defaults.edgeRoutingMode)
    : undefined
  const optimizationGoal = defaults.optimizationGoal
    ? validateEnum(options.optimizationGoal, OPTIMIZATION_GOALS, defaults.optimizationGoal)
    : undefined

  return {
    algorithm,
    direction,
    spacing,
    aspectRatio,
    edgeRouting,
    edgeRoutingMode,
    optimizationGoal,
  }
}
