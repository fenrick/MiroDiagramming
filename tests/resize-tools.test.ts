import {
  applySizeToSelection,
  copySizeFromSelection,
} from '../src/resize-tools';

describe('resize-tools', () => {
  test('copySizeFromSelection returns size', async () => {
    const board = {
      getSelection: jest.fn().mockResolvedValue([{ width: 5, height: 6 }]),
    };
    const size = await copySizeFromSelection(board);
    expect(size).toEqual({ width: 5, height: 6 });
  });

  test('applySizeToSelection updates widgets', async () => {
    const item = { width: 1, height: 1, sync: jest.fn() };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await applySizeToSelection({ width: 10, height: 20 }, board);
    expect(item.width).toBe(10);
    expect(item.height).toBe(20);
    expect(item.sync).toHaveBeenCalled();
  });

  test('copySizeFromSelection returns null when invalid', async () => {
    const board = { getSelection: jest.fn().mockResolvedValue([{}]) };
    const size = await copySizeFromSelection(board);
    expect(size).toBeNull();
  });

  test('applySizeToSelection throws without board', async () => {
    await expect(applySizeToSelection({ width: 1, height: 1 })).rejects.toThrow(
      'Miro board not available',
    );
  });
});
