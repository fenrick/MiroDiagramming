import { act, renderHook } from '@testing-library/react';
import { useOptimisticOps } from '../src/core/hooks/useOptimisticOps';

vi.useFakeTimers();

describe('useOptimisticOps', () => {
  test('rolls back on failure and retries', async () => {
    const showError = vi.fn();
    (
      globalThis as unknown as {
        miro: { board: { notifications: { showError: vi.Mock } } };
      }
    ).miro = { board: { notifications: { showError } } };

    const { result } = renderHook(() => useOptimisticOps());
    const apply = vi.fn();
    const rollback = vi.fn();
    const commit = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(undefined);

    await act(async () => {
      const promise = result.current({ apply, rollback, commit });
      await vi.advanceTimersByTimeAsync(150);
      await promise;
    });

    expect(apply).toHaveBeenCalled();
    expect(commit).toHaveBeenCalledTimes(1);
    expect(rollback).toHaveBeenCalled();
    expect(showError).toHaveBeenCalled();
    const retry = showError.mock.calls[0][1].action.callback as () => void;
    await act(async () => retry());
    expect(commit).toHaveBeenCalledTimes(2);
  });

  test('does not rollback on success', async () => {
    const showError = vi.fn();
    (
      globalThis as unknown as {
        miro: { board: { notifications: { showError: vi.Mock } } };
      }
    ).miro = { board: { notifications: { showError } } };

    const { result } = renderHook(() => useOptimisticOps());
    const rollback = vi.fn();
    const commit = vi.fn().mockResolvedValue(undefined);
    await act(async () => {
      await result.current({ apply: vi.fn(), rollback, commit });
    });
    await vi.advanceTimersByTimeAsync(200);
    expect(rollback).not.toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
  });
});
