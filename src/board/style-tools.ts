/**
 * Colour manipulation utilities for the currently selected widgets.
 */
import { tokens } from '../ui/tokens';
import { colors } from '@mirohq/design-tokens';
import {
  adjustColor,
  ensureContrast,
  resolveColor,
} from '../core/utils/color-utils';
import {
  BoardLike,
  forEachSelection,
  getBoard,
  maybeSync,
  Syncable,
} from './board';

/** Retrieve the property name used for widget fill colour. */
function getFillKey(
  style: Record<string, unknown>,
): 'fillColor' | 'backgroundColor' | null {
  if (typeof style.fillColor === 'string') return 'fillColor';
  if (typeof style.backgroundColor === 'string') return 'backgroundColor';
  return null;
}

/** Retrieve the property name used for widget font colour. */
function getFontKey(
  style: Record<string, unknown>,
): 'color' | 'textColor' | null {
  if (typeof style.color === 'string') return 'color';
  if (typeof style.textColor === 'string') return 'textColor';
  return null;
}

/** Retrieve the property name used for widget opacity. */
function getOpacityKey(
  style: Record<string, unknown>,
): 'fillOpacity' | 'opacity' | null {
  if (typeof style.fillOpacity === 'number') return 'fillOpacity';
  if (typeof style.opacity === 'number') return 'opacity';
  return null;
}

/** Retrieve the property name used for border width. */
function getBorderWidthKey(
  style: Record<string, unknown>,
): 'borderWidth' | 'strokeWidth' | 'lineWidth' | null {
  if (typeof style.borderWidth === 'number') return 'borderWidth';
  if (typeof style.strokeWidth === 'number') return 'strokeWidth';
  if (typeof style.lineWidth === 'number') return 'lineWidth';
  return null;
}

/**
 * Lighten or darken the fill colour of all selected widgets ensuring the
 * text colour maintains sufficient contrast.
 *
 * @param delta - Adjustment amount between -1 (darken) and 1 (lighten).
 * @param board - Optional board API overriding `miro.board` for testing.
 * @returns Resolves once all selected widgets are synchronised.
 */
export async function tweakFillColor(
  delta: number,
  board?: BoardLike,
): Promise<void> {
  await forEachSelection(async (item: Record<string, unknown>) => {
    const style = (item.style ?? {}) as Record<string, unknown>;
    const fillKey = getFillKey(style);
    if (!fillKey) return;
    const fontKey = getFontKey(style);
    const fill =
      typeof style[fillKey] === 'string'
        ? style[fillKey]
        : resolveColor(tokens.color.white, colors.white);
    const font =
      fontKey && typeof style[fontKey] === 'string'
        ? style[fontKey]
        : resolveColor(tokens.color.primaryText, colors['gray-700']);
    const newFill = adjustColor(fill, delta);
    style[fillKey] = newFill;
    if (fontKey) {
      style[fontKey] = ensureContrast(newFill, font);
    }
    item.style = style;
    await maybeSync(item as Syncable);
  }, board);
}

/**
 * Extract the fill colour from a widget style.
 *
 * @param item - Widget record possibly containing a style object.
 * @returns Hex colour string or `null` when unavailable.
 */
export function extractFillColor(
  item: Record<string, unknown> | undefined,
): string | null {
  if (!item) return null;
  const style = (item.style ?? {}) as Record<string, unknown>;
  const key = getFillKey(style);
  if (!key) return null;
  const fill = style[key];
  return typeof fill === 'string' ? resolveColor(fill, colors.white) : null;
}

/**
 * Retrieve the fill colour of the first selected widget.
 *
 * @param board - Optional board API overriding `miro.board` for testing.
 * @returns Hex colour string or `null` when unavailable.
 */
export async function copyFillFromSelection(
  board?: BoardLike,
): Promise<string | null> {
  const b = getBoard(board);
  const selection = await b.getSelection();
  return extractFillColor(selection[0]);
}

/**
 * Adjust opacity for all selected widgets.
 *
 * The function supports both `fillOpacity` and `opacity` properties and
 * clamps the resulting value to the 0–1 range.
 *
 * @param delta - Amount to add to the current opacity.
 * @param board - Optional board API overriding `miro.board` for testing.
 */
export async function tweakOpacity(
  delta: number,
  board?: BoardLike,
): Promise<void> {
  await forEachSelection(async (item: Record<string, unknown>) => {
    const style = (item.style ?? {}) as Record<string, unknown>;
    const key = getOpacityKey(style);
    if (!key) return;
    const current = style[key];
    if (typeof current !== 'number') return;
    let next = current + delta;
    next = Math.max(0, Math.min(1, next));
    style[key] = next;
    item.style = style;
    await maybeSync(item as Syncable);
  }, board);
}

/**
 * Modify border thickness for all selected widgets.
 *
 * Supports a variety of property names such as `borderWidth`,
 * `strokeWidth` or `lineWidth` and ensures values stay positive.
 *
 * @param delta - Amount to add to the current width in board units.
 * @param board - Optional board API overriding `miro.board` for testing.
 */
export async function tweakBorderWidth(
  delta: number,
  board?: BoardLike,
): Promise<void> {
  await forEachSelection(async (item: Record<string, unknown>) => {
    const style = (item.style ?? {}) as Record<string, unknown>;
    const key = getBorderWidthKey(style);
    if (!key) return;
    const current = style[key];
    if (typeof current !== 'number') return;
    const next = Math.max(0, current + delta);
    style[key] = next;
    item.style = style;
    await maybeSync(item as Syncable);
  }, board);
}
