import * as log from '../logger';
import { BoardLike, getBoard, maybeSync, Syncable } from './board';
import { boardCache } from './board-cache';

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
  log.info('Renaming selected frames');
  const selection = await boardCache.getSelection(b);
  const frames = selection.filter(
    (
      i,
    ): i is Record<string, unknown> & {
      x?: number;
      y?: number;
      type?: string;
    } => (i as { type?: string }).type === 'frame',
  );
  if (!frames.length) {
    return;
  }
  frames.sort((a, b) => {
    const ax = a.x ?? 0;
    const bx = b.x ?? 0;
    if (ax === bx) {
      const ay = a.y ?? 0;
      const by = b.y ?? 0;
      return ay - by;
    }
    return ax - bx;
  });
  await Promise.all(
    frames.map(async (frame, i) => {
      frame.title = `${opts.prefix}${i}`;
      await maybeSync(frame as Syncable);
    }),
  );
  log.debug({ count: frames.length }, 'Frames renamed');
}

/**
 * Subset of widget properties required for locking.
 *
 * The `locked` flag is not part of the public Web‑SDK type
 * definitions yet but is present on runtime objects. It indicates
 * whether a widget is locked from user interaction.
 */
interface LockableItem extends Record<string, unknown> {
  /** `true` if the widget is locked. */
  locked?: boolean;
  /** Persist property changes to the board. */
  sync?: () => Promise<void>;
}

/** Frame widget subset used within this module. */
interface FrameLike extends LockableItem {
  /** Widget type discriminator. */
  type?: string;
  /** Retrieve child widgets contained in the frame. */
  getChildren?: () => Promise<LockableItem[]>;
}

/**
 * Check whether a widget is a frame.
 *
 * @param item - Widget to test.
 */
function isFrame(item: Record<string, unknown>): item is FrameLike {
  return (item as { type?: string }).type === 'frame';
}

/**
 * Lock a widget if possible.
 *
 * @param item - Widget to lock.
 */
async function lockItem(item: LockableItem): Promise<void> {
  item.locked = true;
  await maybeSync(item);
}

/**
 * Lock a frame and all of its child widgets.
 *
 * @param frame - Target frame widget.
 */
async function lockFrame(frame: FrameLike): Promise<void> {
  await lockItem(frame);
  const children = (await frame.getChildren?.()) ?? [];
  await Promise.all(children.map(child => lockItem(child)));
}

/**
 * Lock all selected frames and their contents.
 *
 * @param board - Optional board API override for testing.
 */
export async function lockSelectedFrames(board?: BoardLike): Promise<void> {
  const b = getBoard(board);
  log.info('Locking selected frames');
  const selection = await boardCache.getSelection(b);
  const frames = selection.filter(isFrame);
  await Promise.all(frames.map(frame => lockFrame(frame)));
  log.debug({ count: frames.length }, 'Frames locked');
}
