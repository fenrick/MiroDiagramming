import {
  applySpacingLayout,
  calculateSpacingOffsets,
} from '../src/board/spacing-tools';
import { BoardLike } from '../src/board/board';

describe('spacing-tools', () => {
  test('calculateSpacingOffsets computes positions', () => {
    expect(calculateSpacingOffsets(3, 5)).toEqual([0, 5, 10]);
  });

  test('applySpacingLayout spaces widgets horizontally by edges', async () => {
    const items = [
      { x: 0, y: 0, width: 10, sync: jest.fn() },
      { x: 0, y: 0, width: 20, sync: jest.fn() },
      { x: 0, y: 0, width: 10, sync: jest.fn() },
    ];
    const board: BoardLike = {
      getSelection: jest.fn().mockResolvedValue(items),
    };
    await applySpacingLayout({ axis: 'x', spacing: 5 }, board);
    expect(items.map(i => i.x)).toEqual([0, 20, 40]);
    expect(items[0].sync).toHaveBeenCalled();
  });

  test('applySpacingLayout spaces widgets vertically by edges', async () => {
    const items = [
      { x: 0, y: 0, height: 10, sync: jest.fn() },
      { x: 0, y: 0, height: 20, sync: jest.fn() },
    ];
    const board: BoardLike = {
      getSelection: jest.fn().mockResolvedValue(items),
    };
    await applySpacingLayout({ axis: 'y', spacing: 3 }, board);
    expect(items.map(i => i.y)).toEqual([0, 18]);
    expect(items[1].sync).toHaveBeenCalled();
  });

  test('applySpacingLayout returns early on empty selection', async () => {
    const board: BoardLike = { getSelection: jest.fn().mockResolvedValue([]) };
    await applySpacingLayout({ axis: 'y', spacing: 5 }, board);
    expect(board.getSelection).toHaveBeenCalled();
  });

  test('applySpacingLayout throws without board', async () => {
    await expect(applySpacingLayout({ axis: 'x', spacing: 1 })).rejects.toThrow(
      'Miro board not available',
    );
  });
});
