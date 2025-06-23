import { forEachSelection } from '../src/board/board';

describe('forEachSelection', () => {
  describe('callback invocation', () => {
    test('invokes callback once per item', async () => {
      const items = [{ a: 1 }, { b: 2 }];
      const board = { getSelection: jest.fn().mockResolvedValue(items) };
      const cb = jest.fn();
      await forEachSelection(cb, board);
      expect(cb).toHaveBeenCalledTimes(items.length);
      expect(cb).toHaveBeenNthCalledWith(1, items[0]);
      expect(cb).toHaveBeenNthCalledWith(2, items[1]);
    });
  });

  describe('error propagation', () => {
    test('rejects when callback throws', async () => {
      const board = { getSelection: jest.fn().mockResolvedValue([{}]) };
      await expect(
        forEachSelection(() => {
          throw new Error('fail');
        }, board),
      ).rejects.toThrow('fail');
    });
  });
});
