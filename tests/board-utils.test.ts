import { forEachSelection } from '../src/board/board';

describe('forEachSelection', () => {
  test('invokes callback for each item', async () => {
    const items = [{ a: 1 }, { b: 2 }];
    const board = { getSelection: jest.fn().mockResolvedValue(items) };
    const cb = jest.fn();
    await forEachSelection(cb, board);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledWith(items[0]);
    expect(cb).toHaveBeenCalledWith(items[1]);
  });

  test('propagates callback errors', async () => {
    const board = { getSelection: jest.fn().mockResolvedValue([{}]) };
    await expect(
      forEachSelection(() => {
        throw new Error('fail');
      }, board),
    ).rejects.toThrow('fail');
  });
});
