import { BoardLike, getBoard } from './board';

/** Options for renaming selected frames. */
export interface RenameOptions {
  /** Text prefix for the frame titles. */
  prefix: string;
}

/**
 * Rename all selected frames from left to right applying `<prefix><index>`.
 *
 * @param opts - Prefix configuration.
 * @param board - Optional board API override for testing.
 */
export async function renameSelectedFrames(
  opts: RenameOptions,
  board?: BoardLike,
): Promise<void> {
  const b = getBoard(board);
  const selection = await b.getSelection();
  const frames = selection.filter(
    (
      i,
    ): i is Record<string, unknown> & {
      x?: number;
      y?: number;
      type?: string;
    } => (i as { type?: string }).type === 'frame',
  );
  if (!frames.length) return;
  frames.sort((a, b) => {
    const ax = (a.x as number | undefined) ?? 0;
    const bx = (b.x as number | undefined) ?? 0;
    if (ax === bx) {
      const ay = (a.y as number | undefined) ?? 0;
      const by = (b.y as number | undefined) ?? 0;
      return ay - by;
    }
    return ax - bx;
  });
  await Promise.all(
    frames.map(async (frame, i) => {
      frame.title = `${opts.prefix}${i}`;
      const sync = (frame as { sync?: () => Promise<void> }).sync;
      if (typeof sync === 'function') await sync();
    }),
  );
}
