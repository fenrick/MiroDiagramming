import type { Frame } from '@mirohq/websdk-types';
import { BoardBuilder } from '../src/board/board-builder';
import { syncOrUndo, undoWidgets } from '../src/board/undo-utils';

describe('undoWidgets', () => {
  test('removes items when registry populated', async () => {
    const builder = { removeItems: vi.fn() } as unknown as BoardBuilder;
    const list: Array<Frame> = [{} as Frame];
    const orig = [...list];
    await undoWidgets(builder, list);
    const callArg = (builder.removeItems as vi.Mock).mock.calls[0][0];
    expect(callArg).toEqual(orig);
    expect(list.length).toBe(0);
  });

  test('skips removal when registry empty', async () => {
    const builder = { removeItems: vi.fn() } as unknown as BoardBuilder;
    const list: Array<Frame> = [];
    await undoWidgets(builder, list);
    expect(builder.removeItems).not.toHaveBeenCalled();
  });
});

describe('syncOrUndo', () => {
  test('rolls back when sync fails', async () => {
    const builder = {
      syncAll: vi.fn().mockRejectedValue(new Error('fail')),
      removeItems: vi.fn(),
    } as unknown as BoardBuilder;
    const reg: Array<Frame> = [{} as Frame];
    await expect(
      syncOrUndo(builder, reg, [reg[0] as unknown as Frame]),
    ).rejects.toThrow('fail');
    expect(builder.removeItems).toHaveBeenCalled();
    expect(reg).toHaveLength(0);
  });

  test('leaves items intact when sync succeeds', async () => {
    const builder = {
      syncAll: vi.fn(),
      removeItems: vi.fn(),
    } as unknown as BoardBuilder;
    const reg: Array<Frame> = [{} as Frame];
    await syncOrUndo(builder, reg, [reg[0] as unknown as Frame]);
    expect(builder.removeItems).not.toHaveBeenCalled();
    expect(reg).toHaveLength(1);
  });
});
