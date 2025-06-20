/**
 * Helper utilities for applying style properties to all currently selected
 * widgets on the board. Each property is optional and merged into the widget
 * style object.
 */
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
