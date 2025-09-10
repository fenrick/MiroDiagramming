import React, { useEffect } from 'react';
import { styled } from '@mirohq/design-system';
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
      if (lowest <= 0) {
        setState('rateLimited');
        return;
      }
      setBackoffSeconds(null);
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

  useEffect(() => {
    if (state === 'rateLimited' && backoffSeconds === null) {
      setBackoffSeconds(12);
    } else if (state !== 'rateLimited') {
      setBackoffSeconds(null);
    }
  }, [state, backoffSeconds, setBackoffSeconds]);

  useEffect(() => {
    if (backoffSeconds === null || backoffSeconds <= 0) {
      return;
    }
    const id = setTimeout(() => setBackoffSeconds(backoffSeconds - 1), 1000);
    return () => clearTimeout(id);
  }, [backoffSeconds, setBackoffSeconds]);

  const remaining = queue + activeJobs;
  let content: JSX.Element | string;
  let progress: JSX.Element | null = null;

  if (state === 'disconnected') {
    content = 'Disconnected';
  } else if (state === 'rateLimited') {
    content = `Paused for ${backoffSeconds ?? 0}s (auto-resume)`;
  } else if (state === 'nearLimit') {
    content = 'Slowing to avoid limits';
  } else if (remaining > 0) {
    progress = <Progress data-testid='sync-progress' />;
    content = `Syncing ${remaining} changes…`;
  } else {
    content = 'All changes saved';
  }

  return (
    <StatusBar role='status'>
      {progress}
      {content}
    </StatusBar>
  );
}

const StatusBar = styled('div', {
  position: 'absolute',
  bottom: 'var(--space-100)',
  right: 'var(--space-100)',
  padding: 'var(--space-100) var(--space-150)',
  background: 'var(--colors-gray-900)',
  color: 'var(--colors-white)',
  borderRadius: 'var(--radii-100)',
  boxShadow: 'var(--shadows-100)',
  fontSize: 'var(--fontSize-200)',
});

const Progress = styled('div', {
  width: '100%',
  height: 'var(--space-100)',
  borderRadius: 'var(--radii-100)',
  marginBottom: 'var(--space-100)',
  backgroundColor: 'var(--colors-gray-200)',
});
