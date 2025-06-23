import { resolveColor } from '../core/utils/color-utils';
import { BoardLike, getBoard } from './board';
import type { StylePreset } from '../ui/style-presets';

/**
 * Apply a style preset to all selected widgets.
 */
export async function applyStylePreset(
  preset: StylePreset,
  board?: BoardLike,
): Promise<void> {
  const b = getBoard(board);
  const selection = await b.getSelection();
  await Promise.all(
    selection.map(async (item: Record<string, unknown>) => {
      const style = (item.style ?? {}) as Record<string, unknown>;
      style.color = resolveColor(preset.fontColor, '#000000');
      style.borderColor = resolveColor(preset.borderColor, '#000000');
      style.borderWidth = preset.borderWidth;
      style.fillColor = resolveColor(preset.fillColor, '#ffffff');
      item.style = style;
      if (typeof (item as { sync?: () => Promise<void> }).sync === 'function') {
        await (item as { sync: () => Promise<void> }).sync();
      }
    }),
  );
}
