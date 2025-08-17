import { act, renderHook } from '@testing-library/react';
import { useOptimisticOps } from '../src/core/hooks/useOptimisticOps';
import { pushToast } from '../src/ui/components/Toast';

vi.mock('../src/ui/components/Toast', () => ({ pushToast: vi.fn() }));

vi.useFakeTimers();

describe('useOptimisticOps', () => {
  test('rolls back on failure and retries', async () => {
    const { result } = renderHook(() => useOptimisticOps());
    const apply = vi.fn();
    const rollback = vi.fn();
    const commit = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(undefined);

    await act(async () => {
      const promise = result.current({
        apply,
        rollback,
        commit,
        thumbnailUrl: 'img.png',
      });
      await vi.advanceTimersByTimeAsync(150);
      await promise;
    });

    expect(apply).toHaveBeenCalled();
    expect(commit).toHaveBeenCalledTimes(1);
    expect(rollback).toHaveBeenCalled();
    expect(pushToast).toHaveBeenCalled();
    const firstCall = (pushToast as vi.Mock).mock.calls[0][0];
    expect(firstCall.thumbnailUrl).toBe('img.png');
    const retry = firstCall.action.callback as () => void;
    await act(async () => retry());
    expect(commit).toHaveBeenCalledTimes(2);
  });

  test('does not rollback on success', async () => {
    const { result } = renderHook(() => useOptimisticOps());
    const rollback = vi.fn();
    const commit = vi.fn().mockResolvedValue(undefined);
    await act(async () => {
      await result.current({ apply: vi.fn(), rollback, commit });
    });
    await vi.advanceTimersByTimeAsync(200);
    expect(rollback).not.toHaveBeenCalled();
    expect(pushToast).not.toHaveBeenCalled();
  });
});
