import {
  applySpacingLayout,
  calculateSpacingOffsets,
} from '../src/board/spacing-tools';
import { BoardLike } from '../src/board/board';

describe('spacing-tools', () => {
  test('calculateSpacingOffsets computes positions', () => {
    expect(calculateSpacingOffsets(3, 5)).toEqual([0, 5, 10]);
  });

  test('applySpacingLayout moves widgets horizontally', async () => {
    const items = [
      { x: 0, y: 0, sync: jest.fn() },
      { x: 5, y: 0, sync: jest.fn() },
      { x: 2, y: 0, sync: jest.fn() },
    ];
    const board: BoardLike = {
      getSelection: jest.fn().mockResolvedValue(items),
    };
    await applySpacingLayout({ axis: 'x', spacing: 10 }, board);
    const sorted = [...items].sort((a, b) => a.x - b.x);
    expect(sorted.map(i => i.x)).toEqual([0, 10, 20]);
    expect(items[0].sync).toHaveBeenCalled();
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
