import React from 'react';

/**
 * Definition of an optimistic operation applied to the board.
 *
 * The {@link apply} callback should immediately update local state while
 * {@link commit} persists the change remotely. If the commit fails, the
 * {@link rollback} function restores the previous state.
 */
export interface OptimisticOp {
  /** Apply the change locally. */
  apply: () => void;
  /** Persist the change to the server or board. */
  commit: () => Promise<void>;
  /** Revert the local change if committing fails. */
  rollback: () => void | Promise<void>;
}

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

/**
 * React hook executing operations optimistically with automatic rollback on
 * failure. When an operation fails a toast is shown offering the user a chance
 * to retry the single failed action.
 *
 * @returns Function that enqueues an optimistic operation.
 */
export function useOptimisticOps(): (op: OptimisticOp) => Promise<void> {
  const enqueue = React.useCallback(async (op: OptimisticOp): Promise<void> => {
    op.apply();
    try {
      await op.commit();
    } catch {
      await wait(150);
      await op.rollback();
      await miro.board.notifications.showError('Operation failed', {
        action: {
          label: 'Try again',
          callback: () => {
            void enqueue(op);
          },
        },
      });
    }
  }, []);

  return enqueue;
}
