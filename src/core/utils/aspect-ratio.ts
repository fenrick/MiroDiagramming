/**
 * Utilities for handling common aspect ratios when resizing widgets.
 *
 * Ratios are expressed as width divided by height. The `applyAspectRatio`
 * helper computes a rounded height value from a given width.
 */

/** Representation of an aspect ratio preset. */
export interface AspectRatioPreset {
  /** Unique identifier used by the UI. */
  id: AspectRatioId;
  /** Human readable label shown in dropdowns. */
  label: string;
  /** Numeric ratio of width / height. */
  ratio: number;
}

/** Supported preset identifiers. */
export type AspectRatioId = 'golden' | '16:9' | '16:10' | '4:3';

/** Golden ratio constant used by presets. */
export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

/** List of selectable aspect ratios. */
export const ASPECT_RATIOS: AspectRatioPreset[] = [
  { id: 'golden', label: 'Golden', ratio: GOLDEN_RATIO },
  { id: '16:9', label: '16:9', ratio: 16 / 9 },
  { id: '16:10', label: '16:10', ratio: 16 / 10 },
  { id: '4:3', label: '4:3', ratio: 4 / 3 },
];

/**
 * Retrieve the numeric ratio for a preset identifier.
 *
 * @param id - Identifier from `ASPECT_RATIOS`.
 * @returns Width divided by height as a number.
 */
export function aspectRatioValue(id: AspectRatioId): number {
  const preset = ASPECT_RATIOS.find((p) => p.id === id);
  if (!preset) throw new Error(`Unknown aspect ratio: ${id}`);
  return preset.ratio;
}

/**
 * Calculate height from width using a ratio.
 *
 * @param width - Target width in board units.
 * @param ratio - Aspect ratio value (width / height).
 * @returns Rounded height respecting the ratio.
 */
export function ratioHeight(width: number, ratio: number): number {
  return Math.round(width / ratio);
}
