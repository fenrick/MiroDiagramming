import { BoardLike } from '../src/board/board';
import { boardCache } from '../src/board/board-cache';
import {
  calculateGrid,
  calculateGridPositions,
} from '../src/board/grid-layout';
import { applyGridLayout } from '../src/board/grid-tools';

beforeEach(() => boardCache.reset());

describe('grid-tools', () => {
  test('calculateGrid computes grid positions', () => {
    const positions = calculateGrid(3, { cols: 2, padding: 5 }, 10, 10);
    expect(positions).toEqual([
      { x: 0, y: 0 },
      { x: 15, y: 0 },
      { x: 0, y: 15 },
    ]);
  });
  test('calculateGridPositions computes offsets', () => {
    const expected = calculateGrid(4, { cols: 2, padding: 5 }, 10, 10);
    const positions = calculateGridPositions(
      { cols: 2, padding: 5 },
      4,
      10,
      10,
    );
    expect(positions).toEqual(expected);
  });

  test('applyGridLayout positions widgets', async () => {
    const items = [
      { x: 0, y: 0, width: 10, height: 10, sync: vi.fn(), title: 'b' },
      { x: 0, y: 0, width: 10, height: 10, sync: vi.fn(), title: 'a' },
    ];
    const board = {
      getSelection: vi.fn().mockResolvedValue(items),
      group: vi.fn(),
    } as BoardLike;
    await applyGridLayout(
      { cols: 1, padding: 5, sortByName: true, groupResult: true },
      board,
    );
    // Items are sorted so 'a' is positioned first
    expect(items[0].y).toBe(15);
    expect(items[0].x).toBe(0);
    expect(board.group).toHaveBeenCalledWith({ items: [items[1], items[0]] });
    expect(items[0].sync).toHaveBeenCalled();
    expect(items[1].sync).toHaveBeenCalled();
  });

  test('applyGridLayout handles groups as single items', async () => {
    const items = [
      { x: 0, y: 0, width: 10, height: 10, sync: vi.fn(), type: 'group' },
      { x: 0, y: 0, width: 10, height: 10, sync: vi.fn() },
    ];
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue(items) };
    await applyGridLayout({ cols: 2, padding: 5 }, board);
    expect(items[1].x).toBe(15);
    expect(items[1].y).toBe(0);
  });

  test('applyGridLayout returns early with empty selection', async () => {
    const board: BoardLike = {
      getSelection: vi.fn().mockResolvedValue([]),
      group: vi.fn(),
    };
    await applyGridLayout({ cols: 1, padding: 0, groupResult: true }, board);
    expect(board.group).not.toHaveBeenCalled();
  });

  test('applyGridLayout skips grouping when API missing', async () => {
    const items = [{ x: 0, y: 0, width: 10, height: 10, sync: vi.fn() }];
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue(items) };
    await applyGridLayout({ cols: 1, padding: 0, groupResult: true }, board);
    expect(items[0].x).toBe(0);
  });

  test('applyGridLayout sorts by nested text fields', async () => {
    const items = [
      {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        sync: vi.fn(),
        text: { plainText: 'b' },
      },
      {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        sync: vi.fn(),
        text: { plainText: 'a' },
      },
    ];
    const board: BoardLike = {
      getSelection: vi.fn().mockResolvedValue(items),
      group: vi.fn(),
    };
    await applyGridLayout(
      { cols: 1, padding: 0, sortByName: true, groupResult: false },
      board,
    );
    expect(items[0].y).toBe(10); // second item should move down
    expect(items[1].y).toBe(0); // first item sorted up
  });

  test('applyGridLayout sorts vertically when requested', async () => {
    const items = [
      { x: 0, y: 0, width: 10, height: 10, sync: vi.fn(), title: 'b' },
      { x: 0, y: 0, width: 10, height: 10, sync: vi.fn(), title: 'a' },
      { x: 0, y: 0, width: 10, height: 10, sync: vi.fn(), title: 'd' },
      { x: 0, y: 0, width: 10, height: 10, sync: vi.fn(), title: 'c' },
    ];
    const board: BoardLike = {
      getSelection: vi.fn().mockResolvedValue(items),
      group: vi.fn(),
    };
    await applyGridLayout(
      { cols: 2, padding: 5, sortByName: true, sortOrientation: 'vertical' },
      board,
    );
    const byTitle = Object.fromEntries(items.map(i => [i.title, i]));
    expect(byTitle.a.x).toBe(0);
    expect(byTitle.b.y).toBe(15);
    expect(byTitle.c.x).toBe(15);
  });

  test('applyGridLayout handles frames', async () => {
    const items = [
      { x: 0, y: 0, width: 30, height: 20, sync: vi.fn(), type: 'frame' },
      { x: 0, y: 0, width: 10, height: 10, sync: vi.fn(), type: 'shape' },
    ];
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue(items) };
    await applyGridLayout({ cols: 2, padding: 5 }, board);
    expect(items[1].x).toBe(35);
    expect(items[1].y).toBe(0);
  });

  test('applyGridLayout ignores unsupported items', async () => {
    const items = [
      { x: 0, y: 0, width: 10, height: 10, sync: vi.fn() },
      { foo: 'bar' },
    ];
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue(items) };
    await applyGridLayout({ cols: 1, padding: 5 }, board);
    expect(items[0].x).toBe(0);
    expect(items[0].y).toBe(0);
  });

  test('applyGridLayout throws without board', async () =>
    await expect(applyGridLayout({ cols: 1, padding: 0 })).rejects.toThrow(
      'Miro board not available',
    ));
});
