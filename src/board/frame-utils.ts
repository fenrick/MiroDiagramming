import type { BaseItem, Connector, Frame, Group } from '@mirohq/websdk-types';
import { BoardBuilder } from './board-builder';

/**
 * Create a frame and register it for undo handling.
 *
 * @param builder - Board builder instance used to create frames.
 * @param registry - Collection tracking created widgets for undo.
 * @param width - Frame width.
 * @param height - Frame height.
 * @param spot - Location where the frame should be centred.
 * @param title - Optional frame title.
 * @returns The created frame.
 */
export async function registerFrame(
  builder: BoardBuilder,
  registry: Array<BaseItem | Group | Connector | Frame>,
  width: number,
  height: number,
  spot: { x: number; y: number },
  title?: string,
): Promise<Frame> {
  const frame = await builder.createFrame(width, height, spot.x, spot.y, title);
  registry.push(frame);
  return frame;
}

/**
 * Clear the active frame on the builder when no frame should be created.
 *
 * @param builder - Board builder instance whose frame is cleared.
 */
export function clearActiveFrame(builder: BoardBuilder): void {
  builder.setFrame(undefined);
}
