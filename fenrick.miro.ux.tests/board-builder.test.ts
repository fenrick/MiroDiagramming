import { expect, test } from 'vitest';
import { BoardBuilder } from '../fenrick.miro.ux/src/board/board-builder';

test('stores and retrieves frame', () => {
  const builder = new BoardBuilder();
  const frame: { id: string } = { id: '1' };
  builder.setFrame(frame);
  expect(builder.getFrame()).toBe(frame);
  builder.reset();
  expect(builder.getFrame()).toBeUndefined();
});
