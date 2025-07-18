/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { useSelection } from '../src/ui/hooks/use-selection';
import { BoardLike } from '../src/board/board';

describe('useSelection', () => {
  test('fetches initial selection', async () => {
    const board: BoardLike = {
      getSelection: jest.fn().mockResolvedValue([{ id: 1 }]),
      ui: { on: jest.fn(), off: jest.fn() },
    };
    const { result } = renderHook(() => useSelection(board));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toEqual([{ id: 1 }]);
  });

  test('updates when event fires', async () => {
    let cb: (ev: { items: unknown[] }) => void = () => {};
    const board: BoardLike = {
      getSelection: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 2 }]),
      ui: {
        on: jest.fn().mockImplementation((_, fn) => {
          cb = fn;
        }),
        off: jest.fn(),
      },
    };
    const { result, unmount } = renderHook(() => useSelection(board));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toEqual([]);
    await act(async () => {
      await cb({ items: [{ id: 2 }] });
    });
    expect(result.current).toEqual([{ id: 2 }]);
    unmount();
    expect(board.ui.off).toHaveBeenCalledWith('selection:update', cb);
  });

  test('returns empty array when board missing', async () => {
    const { result } = renderHook(() => useSelection());
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toEqual([]);
  });

  test('works with board lacking ui API', async () => {
    const board: BoardLike = {
      getSelection: jest.fn().mockResolvedValue([{ id: 3 }]),
    };
    const { result } = renderHook(() => useSelection(board));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toEqual([{ id: 3 }]);
  });
});
