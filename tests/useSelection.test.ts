/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useSelection } from '../src/useSelection';
import { BoardLike } from '../src/board';

describe('useSelection', () => {
  test('fetches initial selection', async () => {
    const board: BoardLike = {
      getSelection: jest.fn().mockResolvedValue([{ id: 1 }]),
      ui: { on: jest.fn() },
    };
    const { result } = renderHook(() => useSelection(board));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toEqual([{ id: 1 }]);
  });

  test('updates when event fires', async () => {
    let cb: () => void = () => {};
    const board: BoardLike = {
      getSelection: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 2 }]),
      ui: {
        on: jest.fn().mockImplementation((_, fn) => {
          cb = fn;
        }),
      },
    };
    const { result } = renderHook(() => useSelection(board));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toEqual([]);
    await act(async () => {
      await cb();
    });
    expect(result.current).toEqual([{ id: 2 }]);
  });
});
