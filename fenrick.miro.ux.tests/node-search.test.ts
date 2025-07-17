import { describe, expect, test, vi } from 'vitest';
import {
  searchShapes,
  searchGroups,
} from 'fenrick.miro.ux/board/node-search';
import { boardCache } from 'fenrick.miro.ux/board/board-cache';
import type { BoardQueryLike } from 'fenrick.miro.ux/board/board';

const board: BoardQueryLike = {
  get: vi.fn(({ type }) => {
    if (type === 'shape') return Promise.resolve([{ content: 'A' }]);
    if (type === 'group')
      return Promise.resolve([
        { getItems: () => Promise.resolve([{ content: 'B' }]) },
      ]);
    return Promise.resolve([]);
  }),
  getSelection: vi.fn().mockResolvedValue([]),
} as unknown as BoardQueryLike;

describe('node-search', () => {
  afterEach(() => {
    boardCache.reset();
    vi.clearAllMocks();
  });

  test('searchShapes caches board.get results', async () => {
    const first = await searchShapes(board, undefined, 'A');
    const second = await searchShapes(board, undefined, 'A');
    expect(first).toEqual({ content: 'A' });
    expect(second).toEqual({ content: 'A' });
    expect(board.get).toHaveBeenCalledTimes(1);
  });

  test('searchGroups caches board.get results', async () => {
    const first = await searchGroups(board, 'type', 'B');
    const second = await searchGroups(board, 'type', 'B');
    expect(first).toEqual({ getItems: expect.any(Function) });
    expect(second).toBe(first);
    expect(board.get).toHaveBeenCalledTimes(1);
  });
});
