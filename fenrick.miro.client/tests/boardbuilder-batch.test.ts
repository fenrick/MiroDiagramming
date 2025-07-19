import { beforeEach, describe, expect, test, vi } from 'vitest';
import { BoardBuilder } from '../src/board/board-builder';
import { mockBoard } from './mock-board';
import { boardCache } from '../src/board/board-cache';

beforeEach(() => boardCache.reset());

describe('BoardBuilder batch operations', () => {
  test('createEdges uses board batch methods', async () => {
    const start = vi.fn();
    const end = vi.fn();
    const board = mockBoard({
      startBatch: start,
      endBatch: end,
      createConnector: vi.fn().mockResolvedValue({ id: 'c1' }),
    });
    const builder = new BoardBuilder();
    await builder.createEdges([{ from: 'a', to: 'b' }], {
      a: { id: 'a' },
      b: { id: 'b' },
    } as Record<string, unknown>);
    expect(start).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
    expect(board.createConnector).toHaveBeenCalledTimes(1);
  });

  test('removeItems uses board batch methods', async () => {
    const start = vi.fn();
    const end = vi.fn();
    const remove = vi.fn().mockResolvedValue(undefined);
    mockBoard({ startBatch: start, endBatch: end, remove });
    const builder = new BoardBuilder();
    await builder.removeItems([{ id: 'x' }] as Array<Record<string, unknown>>);
    expect(start).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith({ id: 'x' });
  });
});
