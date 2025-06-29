import type { BaseItem, Connector, Frame, Group } from '@mirohq/websdk-types';
import { BoardBuilder } from './board-builder';

/**
 * Conditionally create a frame and register it for undo handling.
 *
 * When {@link useFrame} is `false` no frame is created and the builder
 * clears its active frame reference.
 *
 * @param builder - Board builder instance used to create frames.
 * @param registry - Collection tracking created widgets for undo.
 * @param useFrame - Whether to create a frame.
 * @param width - Frame width.
 * @param height - Frame height.
 * @param spot - Location where the frame should be centred.
 * @param title - Optional frame title.
 * @returns The created frame or `undefined`.
 */
export async function maybeCreateFrame(
  builder: BoardBuilder,
  registry: Array<BaseItem | Group | Connector | Frame>,
  useFrame: boolean,
  width: number,
  height: number,
  spot: { x: number; y: number },
  title?: string,
): Promise<Frame | undefined> {
  if (!useFrame) {
    builder.setFrame(undefined);
    return undefined;
  }
  const frame = await builder.createFrame(width, height, spot.x, spot.y, title);
  registry.push(frame);
  return frame;
}
