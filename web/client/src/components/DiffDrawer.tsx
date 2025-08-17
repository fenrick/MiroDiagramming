import React from 'react';
import { Button } from '../ui/components/Button';
import { ShapeClient } from '../core/utils/shape-client';
import { useFocusTrap } from '../core/hooks/useFocusTrap';
import type { DiffResult } from '../board/computeDiff';

export interface DiffDrawerProps<T extends { id?: string }> {
  /** Identifier of the target board. */
  readonly boardId: string;
  /** Diffed changes to display and apply. */
  readonly diff: DiffResult<T>;
  /** Invoked when the drawer should close. */
  readonly onClose: () => void;
  /** Optional callback receiving the resulting job identifier. */
  readonly onApplied?: (jobId: string) => void;
}

/**
 * Drawer listing pending board changes and allowing batch submission.
 */
export function DiffDrawer<T extends { id?: string }>({
  boardId,
  diff,
  onClose,
  onApplied,
}: DiffDrawerProps<T>): React.JSX.Element {
  const total = diff.creates.length + diff.updates.length + diff.deletes.length;

  const applyChanges = React.useCallback(async () => {
    if (total === 0) {
      return;
    }
    const client = new ShapeClient(boardId);
    const ops = [
      ...diff.creates.map(d => ({ op: 'create', data: d })),
      ...diff.updates.map(d => ({ op: 'update', id: d.id, data: d })),
      ...diff.deletes.map(d => ({ op: 'delete', id: d.id })),
    ];
    const idempotencyKey = crypto.randomUUID();
    const { jobId } = await client.applyOperations(ops, idempotencyKey);
    onApplied?.(jobId);
  }, [boardId, diff, onApplied, total]);

  const trapRef = useFocusTrap<HTMLDivElement>(true, onClose);

  return (
    <aside
      className='diff-drawer scrollable'
      ref={trapRef}
      role='dialog'
      aria-modal='true'>
      <h2>Pending changes</h2>
      <ul>
        {diff.creates.map((c, i) => (
          <li key={`c${i}`}>
            <span className='diff-chip diff-create'>Create</span>
            <span
              className='truncate'
              title={String((c as { id?: string }).id ?? i)}>
              {(c as { id?: string }).id ?? i}
            </span>
          </li>
        ))}
        {diff.updates.map((u, i) => (
          <li key={`u${i}`}>
            <span className='diff-chip diff-update'>Update</span>
            <span
              className='truncate'
              title={String((u as { id?: string }).id ?? i)}>
              {(u as { id?: string }).id ?? i}
            </span>
          </li>
        ))}
        {diff.deletes.map((d, i) => (
          <li key={`d${i}`}>
            <span className='diff-chip diff-delete'>Delete</span>
            <span
              className='truncate'
              title={String((d as { id?: string }).id ?? i)}>
              {(d as { id?: string }).id ?? i}
            </span>
          </li>
        ))}
      </ul>
      <div className='buttons'>
        <Button
          variant='tertiary'
          onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => void applyChanges()}
          disabled={total === 0}
          title={total === 0 ? 'No changes' : undefined}>
          {`Apply ${total} changes`}
        </Button>
      </div>
    </aside>
  );
}
