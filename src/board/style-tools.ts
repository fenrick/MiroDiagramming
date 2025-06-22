/**
 * Helper utilities for applying style properties to all currently selected
 * widgets on the board. Each property is optional and merged into the widget
 * style object.
 */
import { tokens } from '../ui/tokens';
import { colors } from '@mirohq/design-tokens';
import {
  adjustColor,
  ensureContrast,
  resolveColor,
} from '../core/utils/color-utils';
import { BoardLike, getBoard } from './board';

export interface StyleOptions {
  /** Text color for supported widgets */
  color?: string;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fontSize?: number;
}

/** Get the fill colour of the first selected widget. */
export async function getFillColorFromSelection(
  board?: BoardLike,
): Promise<string | null> {
  const b = getBoard(board);
  const selection = await b.getSelection();
  const first = selection[0] as { style?: { fillColor?: string } } | undefined;
  return first?.style?.fillColor ?? null;
}

/**
 * Apply the provided style options to every selected widget.
 *
 * @param opts - Style attributes to merge into each widget's style object.
 * @param board - Optional board API used for testing.
 */
export async function applyStyleToSelection(
  opts: StyleOptions,
  board?: BoardLike,
): Promise<void> {
  const b = getBoard(board);
  const selection = await b.getSelection();
  await Promise.all(
    selection.map(async (item: Record<string, unknown>) => {
      const style = (item.style ?? {}) as Record<string, unknown>;
      Object.entries(opts).forEach(([k, v]) => {
        let fallback = String(v);
        if (v === tokens.color.white) fallback = colors.white;
        if (v === tokens.color.primaryText) fallback = colors['gray-700'];
        style[k] = typeof v === 'string' ? resolveColor(v, fallback) : v;
      });
      item.style = style;
      if (typeof (item as { sync?: () => Promise<void> }).sync === 'function') {
        await (item as { sync: () => Promise<void> }).sync();
      }
    }),
  );
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
  const b = getBoard(board);
  const selection = await b.getSelection();
  await Promise.all(
    selection.map(async (item: Record<string, unknown>) => {
      const style = (item.style ?? {}) as Record<string, unknown>;
      const fill =
        typeof style.fillColor === 'string'
          ? style.fillColor
          : resolveColor(tokens.color.white, colors.white);
      const font =
        typeof style.color === 'string'
          ? style.color
          : resolveColor(tokens.color.primaryText, colors['gray-700']);
      const newFill = adjustColor(fill, delta);
      style.fillColor = newFill;
      style.color = ensureContrast(newFill, font);
      item.style = style;
      if (typeof (item as { sync?: () => Promise<void> }).sync === 'function') {
        await (item as { sync: () => Promise<void> }).sync();
      }
    }),
  );
}
