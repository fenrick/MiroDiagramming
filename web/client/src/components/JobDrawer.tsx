import React from 'react';
import { useJob } from '../core/hooks/useJob';
import { useFocusTrap } from '../core/hooks/useFocusTrap';
import { Button, Checkbox } from '../ui/components';

interface JobDrawerProps {
  /** Identifier of the job to display. */
  jobId: string;
  /** Whether the drawer is visible. */
  isOpen: boolean;
  /** Callback invoked when the drawer closes. */
  onClose: () => void;
}

/**
 * Drawer showing live progress for a batch job.
 */
export function JobDrawer({
  jobId,
  isOpen,
  onClose,
}: JobDrawerProps): JSX.Element | null {
  const job = useJob(jobId);
  const [closeOnDone, setCloseOnDone] = React.useState(true);
  const [hiddenOps, setHiddenOps] = React.useState<Set<string>>(new Set());
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const [announcement, setAnnouncement] = React.useState('');

  React.useEffect(() => {
    if (!job) {
      return;
    }
    const timers: NodeJS.Timeout[] = [];
    job.operations.forEach(op => {
      if (op.status === 'done' && !hiddenOps.has(op.id)) {
        timers.push(
          setTimeout(() => {
            setHiddenOps(prev => new Set(prev).add(op.id));
          }, 2000),
        );
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [job, hiddenOps]);

  React.useEffect(() => {
    if (!job) {
      return;
    }
    const done = job.status === 'done';
    const failed = job.status === 'failed' || job.status === 'partial';
    if (failed) {
      const first = job.operations.find(op => op.status === 'failed');
      const el = first ? document.getElementById(`job-op-${first.id}`) : null;
      el?.focus();
    } else if (done && closeOnDone) {
      onClose();
    }
  }, [job, closeOnDone, onClose]);

  React.useEffect(() => {
    if (job) {
      if (job.status === 'working') {
        setAnnouncement(`Syncing ${job.operations.length} changes…`);
      } else if (job.status === 'done') {
        setAnnouncement('All changes synced');
      } else if (job.status === 'failed' || job.status === 'partial') {
        setAnnouncement('Sync failed');
      }
    }
  }, [job]);

  if (!isOpen) {
    return null;
  }

  return (
    <aside
      ref={trapRef}
      className='drawer scrollable'
      role='dialog'
      aria-modal='true'>
      <div
        aria-live='polite'
        role='status'
        className='custom-visually-hidden'>
        {announcement}
      </div>
      <Checkbox
        label='Close when done'
        value={closeOnDone}
        onChange={setCloseOnDone}
      />
      <ul>
        {job?.operations
          .filter(op => !hiddenOps.has(op.id))
          .map(op => (
            <li
              key={op.id}
              id={`job-op-${op.id}`}
              tabIndex={-1}>
              <span
                className='truncate'
                title={op.id}>
                {op.id}
              </span>
              <span>{op.status}</span>
              {op.status === 'failed' && (
                <>
                  <Button variant='tertiary'>Retry</Button>
                  <Button variant='ghost'>Details</Button>
                </>
              )}
            </li>
          ))}
      </ul>
      <div className='buttons'>
        <Button
          variant='tertiary'
          onClick={onClose}>
          Close
        </Button>
      </div>
    </aside>
  );
}
