import { maybeCreateFrame } from '../src/board/frame-utils';
import type { Frame } from '@mirohq/websdk-types';
import { BoardBuilder } from '../src/board/board-builder';

describe('maybeCreateFrame', () => {
  test('creates frame when enabled', async () => {
    const builder = {
      createFrame: jest.fn().mockResolvedValue({ id: 'f' }),
      setFrame: jest.fn(),
    } as unknown as BoardBuilder;
    const list: Array<Frame> = [] as unknown as Array<Frame>;
    const frame = await maybeCreateFrame(
      builder,
      list,
      true,
      10,
      20,
      { x: 1, y: 2 },
      't',
    );
    expect(builder.createFrame).toHaveBeenCalledWith(10, 20, 1, 2, 't');
    expect(frame).toEqual({ id: 'f' });
    expect(list).toContain(frame);
  });

  test('skips frame when disabled', async () => {
    const builder = {
      createFrame: jest.fn(),
      setFrame: jest.fn(),
    } as unknown as BoardBuilder;
    const list: Array<Frame> = [] as unknown as Array<Frame>;
    const frame = await maybeCreateFrame(builder, list, false, 5, 5, {
      x: 0,
      y: 0,
    });
    expect(frame).toBeUndefined();
    expect(builder.createFrame).not.toHaveBeenCalled();
    expect(builder.setFrame).toHaveBeenCalledWith(undefined);
  });
});
