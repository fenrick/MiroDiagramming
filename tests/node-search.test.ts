import { describe, test, expect, vi } from 'vitest';
import type { BoardQueryLike } from '../src/board/board';
import {
  findByMetadata,
  searchShapes,
  searchGroups,
} from '../src/board/node-search';

interface Meta {
  rowId: number;
}
interface Item {
  getMetadata: (key: string) => Promise<Meta>;
}

describe('findByMetadata', () => {
  test('returns first item matching predicate', async () => {
    const a: Item = { getMetadata: vi.fn().mockResolvedValue({ rowId: 1 }) };
    const b: Item = { getMetadata: vi.fn().mockResolvedValue({ rowId: 2 }) };
    const result = await findByMetadata<Item>([a, b], (m) => m.rowId === 2);
    expect(result).toBe(b);
    expect(a.getMetadata).toHaveBeenCalled();
    expect(b.getMetadata).toHaveBeenCalled();
  });

  test('returns undefined when no match found', async () => {
    const a: Item = { getMetadata: vi.fn().mockResolvedValue({ rowId: 1 }) };
    const result = await findByMetadata<Item>([a], () => false);
    expect(result).toBeUndefined();
  });
});

describe('searchShapes', () => {
  test('finds shape by label from board query', async () => {
    const shapeA = { content: 'A' };
    const shapeB = { content: 'B' };
    const board: BoardQueryLike = {
      get: vi.fn().mockResolvedValue([shapeA, shapeB]),
      getSelection: vi.fn(),
    } as unknown as BoardQueryLike;
    const result = await searchShapes(board, undefined, 'B');
    expect(result).toBe(shapeB);
    expect(board.get).toHaveBeenCalledWith({ type: 'shape' });
  });

  test('returns undefined when label missing', async () => {
    const board: BoardQueryLike = {
      get: vi.fn().mockResolvedValue([{ content: 'A' }]),
      getSelection: vi.fn(),
    } as unknown as BoardQueryLike;
    const result = await searchShapes(board, undefined, 'X');
    expect(result).toBeUndefined();
  });

  test('uses provided cache without querying board', async () => {
    const shape = { content: 'A' };
    const cache = new Map<string, unknown>([['A', shape]]);
    const board: BoardQueryLike = {
      get: vi.fn(),
      getSelection: vi.fn(),
    } as unknown as BoardQueryLike;
    const result = await searchShapes(board, cache, 'A');
    expect(result).toBe(shape);
    expect(board.get).not.toHaveBeenCalled();
  });
});

describe('searchGroups', () => {
  test('locates group containing item with matching metadata', async () => {
    const item = {
      getMetadata: vi.fn().mockResolvedValue({ type: 'Business', label: 'A' }),
    };
    const groupA = { getItems: vi.fn().mockResolvedValue([item]) };
    const board: BoardQueryLike = {
      get: vi.fn().mockResolvedValue([groupA]),
      getSelection: vi.fn(),
    } as unknown as BoardQueryLike;
    const result = await searchGroups(board, 'Business', 'A');
    expect(result).toBe(groupA);
  });

  test('returns undefined when no matching group found', async () => {
    const item = {
      getMetadata: vi.fn().mockResolvedValue({ type: 'Business', label: 'B' }),
    };
    const group = { getItems: vi.fn().mockResolvedValue([item]) };
    const board: BoardQueryLike = {
      get: vi.fn().mockResolvedValue([group]),
      getSelection: vi.fn(),
    } as unknown as BoardQueryLike;
    const result = await searchGroups(board, 'Business', 'A');
    expect(result).toBeUndefined();
  });
});
