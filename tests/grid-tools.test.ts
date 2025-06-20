import {
  applyGridLayout,
  calculateGridPositions,
  BoardLike,
} from '../src/grid-tools';

describe('grid-tools', () => {
  test('calculateGridPositions computes offsets', () => {
    const positions = calculateGridPositions(
      { cols: 2, rows: 2, padding: 5 },
      10,
      10,
    );
    expect(positions).toHaveLength(4);
    expect(positions[1]).toEqual({ x: 15, y: 0 });
    expect(positions[2]).toEqual({ x: 0, y: 15 });
  });

  test('applyGridLayout positions widgets', async () => {
    const items = [
      { x: 0, y: 0, width: 10, height: 10, sync: jest.fn(), title: 'b' },
      { x: 0, y: 0, width: 10, height: 10, sync: jest.fn(), title: 'a' },
    ];
    const board = {
      selection: { get: jest.fn().mockResolvedValue(items) },
      group: jest.fn(),
    };
    await applyGridLayout(
      { cols: 1, rows: 2, padding: 5, sortByName: true, groupResult: true },
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
      { x: 0, y: 0, width: 10, height: 10, sync: jest.fn(), type: 'group' },
      { x: 0, y: 0, width: 10, height: 10, sync: jest.fn() },
    ];
    const board: BoardLike = {
      selection: { get: jest.fn().mockResolvedValue(items) },
    };
    await applyGridLayout({ cols: 2, rows: 1, padding: 5 }, board);
    expect(items[1].x).toBe(15);
    expect(items[1].y).toBe(0);
  });
});
