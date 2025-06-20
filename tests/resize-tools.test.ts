import {
  applySizeToSelection,
  copySizeFromSelection,
} from '../src/resize-tools';

describe('resize-tools', () => {
  test('copySizeFromSelection returns size', async () => {
    const board = {
      selection: {
        get: jest.fn().mockResolvedValue([{ width: 5, height: 6 }]),
      },
    };
    const size = await copySizeFromSelection(board);
    expect(size).toEqual({ width: 5, height: 6 });
  });

  test('applySizeToSelection updates widgets', async () => {
    const item = { width: 1, height: 1, sync: jest.fn() };
    const board = { selection: { get: jest.fn().mockResolvedValue([item]) } };
    await applySizeToSelection({ width: 10, height: 20 }, board);
    expect(item.width).toBe(10);
    expect(item.height).toBe(20);
    expect(item.sync).toHaveBeenCalled();
  });
});
