/**
 * Helper utilities for applying style properties to all currently selected
 * widgets on the board. Each property is optional and merged into the widget
 * style object.
 */
import { adjustColor, ensureContrast } from './color-utils';
export interface StyleOptions {
  fontColor?: string;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fontSize?: number;
}

export interface BoardLike {
  selection: {
    get(): Promise<Array<Record<string, unknown>>>;
  };
}

/** Get the fill colour of the first selected widget. */
export async function getFillColorFromSelection(
  board?: BoardLike,
): Promise<string | null> {
  const b =
    board ??
    (globalThis as unknown as { miro?: { board?: BoardLike } }).miro?.board;
  if (!b) throw new Error('Miro board not available');
  const selection = await b.selection.get();
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
  const b =
    board ??
    (globalThis as unknown as { miro?: { board?: BoardLike } }).miro?.board;
  if (!b) throw new Error('Miro board not available');
  const selection = await b.selection.get();
  await Promise.all(
    selection.map(async (item: Record<string, unknown>) => {
      const style = (item.style ?? {}) as Record<string, unknown>;
      Object.assign(style, opts);
      item.style = style;
      const sync = (item as { sync?: () => Promise<void> }).sync;
      if (typeof sync === 'function') {
        await sync();
      }
    }),
  );
}

/**
 * Lighten or darken the fill colour of all selected widgets ensuring the
 * font colour maintains sufficient contrast.
 *
 * @param delta - Adjustment amount between -1 (darken) and 1 (lighten).
 * @param board - Optional board API overriding `miro.board` for testing.
 */
export async function tweakFillColor(
  delta: number,
  board?: BoardLike,
): Promise<void> {
  const b =
    board ??
    (globalThis as unknown as { miro?: { board?: BoardLike } }).miro?.board;
  if (!b) throw new Error('Miro board not available');
  const selection = await b.selection.get();
  await Promise.all(
    selection.map(async (item: Record<string, unknown>) => {
      const style = (item.style ?? {}) as Record<string, unknown>;
      const fill =
        typeof style.fillColor === 'string' ? style.fillColor : '#fff';
      const font =
        typeof style.fontColor === 'string' ? style.fontColor : '#1a1a1a';
      const newFill = adjustColor(fill, delta);
      style.fillColor = newFill;
      style.fontColor = ensureContrast(newFill, font);
      item.style = style;
      const sync = (item as { sync?: () => Promise<void> }).sync;
      if (typeof sync === 'function') {
        await sync();
      }
    }),
  );
}
