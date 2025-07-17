import { describe, expect, test, vi } from 'vitest';
import { boardCache } from 'fenrick.miro.ux/board/board-cache';
import type { BoardQueryLike } from 'fenrick.miro.ux/board/board';

describe('BoardCache', () => {
  afterEach(() => {
    boardCache.reset();
  });

  test('selection result is cached', async () => {
    const items = [{}];
    const board: BoardQueryLike = {
      getSelection: vi.fn().mockResolvedValue(items),
      get: vi.fn(),
    } as unknown as BoardQueryLike;
    await boardCache.getSelection(board);
    await boardCache.getSelection(board);
    expect(board.getSelection).toHaveBeenCalledTimes(1);
  });

  test('clearSelection invalidates cache', async () => {
    const board: BoardQueryLike = {
      getSelection: vi
        .fn()
        .mockResolvedValueOnce([{ a: 1 }])
        .mockResolvedValueOnce([{ b: 2 }]),
      get: vi.fn(),
    } as unknown as BoardQueryLike;
    const first = await boardCache.getSelection(board);
    boardCache.clearSelection();
    const second = await boardCache.getSelection(board);
    expect(first[0]).toHaveProperty('a');
    expect(second[0]).toHaveProperty('b');
    expect(board.getSelection).toHaveBeenCalledTimes(2);
  });

  test('setSelection stores selection from event', async () => {
    const board: BoardQueryLike = {
      getSelection: vi.fn().mockResolvedValue([{ id: 1 }]),
      get: vi.fn(),
    } as unknown as BoardQueryLike;
    boardCache.setSelection([{ id: 2 }]);
    const result = await boardCache.getSelection(board);
    expect(result).toEqual([{ id: 2 }]);
    expect(board.getSelection).not.toHaveBeenCalled();
  });

  test('widget queries are cached per type', async () => {
    const board: BoardQueryLike = {
      getSelection: vi.fn(),
      get: vi.fn(({ type }) => {
        return type === 'shape'
          ? Promise.resolve([{ s: 1 }])
          : Promise.resolve([{ g: 1 }]);
      }),
    } as unknown as BoardQueryLike;
    const first = await boardCache.getWidgets(['shape', 'group'], board);
    const second = await boardCache.getWidgets(['shape', 'group'], board);
    expect(first).toEqual([{ s: 1 }, { g: 1 }]);
    expect(second).toEqual([{ s: 1 }, { g: 1 }]);
    expect(board.get).toHaveBeenCalledTimes(2);
  });
});
