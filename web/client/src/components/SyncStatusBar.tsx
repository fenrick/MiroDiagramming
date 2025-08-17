import React, { useEffect } from 'react';
import { useSyncStore } from '../core/state/sync-store';
import { apiFetch } from '../core/utils/api-fetch';

const POLL_INTERVAL_MS = 5000;
const NEAR_LIMIT_THRESHOLD = 10;

/**
 * Displays global synchronisation and rate limit status.
 */
export function SyncStatusBar(): JSX.Element {
  const {
    queue,
    activeJobs,
    state,
    setState,
    setQueue,
    backoffSeconds,
    setBackoffSeconds,
  } = useSyncStore();

  useEffect(() => {
    let cancelled = false;
    const applyLimits = (data: {
      queue_length: number;
      bucket_fill: Record<string, number>;
    }): void => {
      setQueue(data.queue_length);
      const lowest = Math.min(...Object.values(data.bucket_fill));
      setBackoffSeconds(null);
      if (lowest <= 0) {
        setState('rateLimited');
        return;
      }
      if (lowest <= NEAR_LIMIT_THRESHOLD) {
        setState('nearLimit');
        return;
      }
      setState('ok');
    };

    const poll = async (): Promise<void> => {
      try {
        const res = await apiFetch('/api/limits');
        if (!res.ok) {
          throw new Error('status ' + res.status);
        }
        const data = (await res.json()) as {
          queue_length: number;
          bucket_fill: Record<string, number>;
        };
        if (!cancelled) {
          applyLimits(data);
        }
      } catch {
        if (!cancelled) {
          setState('disconnected');
          setBackoffSeconds(null);
        }
      }
    };
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [setBackoffSeconds, setQueue, setState]);

  const remaining = queue + activeJobs;
  let content: JSX.Element | string;

  if (state === 'disconnected') {
    content = 'Disconnected';
  } else if (state === 'rateLimited') {
    content = `Pausing for ${backoffSeconds ?? 0}s (auto-resume)`;
  } else if (state === 'nearLimit') {
    content = 'Slowing to avoid limits';
  } else if (remaining > 0) {
    content = (
      <span>
        <span
          role='img'
          aria-label='loading'>
          ⏳
        </span>{' '}
        {remaining} items remaining
      </span>
    );
  } else {
    content = 'All changes saved';
  }

  return (
    <div
      className='sync-status-bar'
      role='status'>
      {content}
    </div>
  );
}
