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
import { BoardLike, getBoard } from './board';

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
