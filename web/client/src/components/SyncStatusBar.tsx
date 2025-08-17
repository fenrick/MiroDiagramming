import React, { useEffect } from 'react';
import { useSyncStore } from '../core/state/sync-store';

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
    setRemainingCredits,
    backoffSeconds,
    setBackoffSeconds,
  } = useSyncStore();

  useEffect(() => {
    let cancelled = false;
    const applyLimits = (data: {
      remaining: number;
      retryAfter?: number;
    }): void => {
      setRemainingCredits(data.remaining);
      setBackoffSeconds(data.retryAfter ?? null);
      if (data.retryAfter && data.retryAfter > 0) {
        setState('rateLimited');
        return;
      }
      if (data.remaining <= NEAR_LIMIT_THRESHOLD) {
        setState('nearLimit');
        return;
      }
      setState('ok');
    };

    const poll = async (): Promise<void> => {
      try {
        const res = await fetch('/limits');
        if (!res.ok) {
          throw new Error('status ' + res.status);
        }
        const data = (await res.json()) as {
          remaining: number;
          retryAfter?: number;
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
  }, [setBackoffSeconds, setRemainingCredits, setState]);

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
