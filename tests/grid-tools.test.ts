import { applyGridLayout, calculateGridPositions } from '../src/grid-tools';

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
      { x: 0, y: 0, width: 10, height: 10, sync: jest.fn() },
      { x: 0, y: 0, width: 10, height: 10, sync: jest.fn() },
    ];
    const board = { selection: { get: jest.fn().mockResolvedValue(items) } };
    await applyGridLayout({ cols: 1, rows: 2, padding: 5 }, board);
    expect(items[1].y).toBe(15);
    expect(items[1].x).toBe(0);
    expect(items[0].sync).toHaveBeenCalled();
    expect(items[1].sync).toHaveBeenCalled();
  });
});
