import { create } from 'zustand';

/**
 * State describing the current synchronisation and rate limit status.
 */
export type SyncState = 'ok' | 'nearLimit' | 'rateLimited' | 'disconnected';

/**
 * Store for tracking synchronisation progress and API limits.
 */
export interface SyncStore {
  /** Number of queued sync operations. */
  queue: number;
  /** Number of active sync jobs. */
  activeJobs: number;
  /** Remaining API credits; null when unknown. */
  remainingCredits: number | null;
  /** Current state of synchronisation and rate limiting. */
  state: SyncState;
  /** Seconds to wait before retrying when rate limited. */
  backoffSeconds: number | null;
  /** Update the queue length. */
  setQueue: (queue: number) => void;
  /** Update the number of active jobs. */
  setActiveJobs: (jobs: number) => void;
  /** Update remaining API credits. */
  setRemainingCredits: (credits: number | null) => void;
  /** Update the synchronisation state. */
  setState: (state: SyncState) => void;
  /** Update the rate limit backoff timer. */
  setBackoffSeconds: (seconds: number | null) => void;
}

/**
 * Hook exposing the global synchronisation store.
 */
export const useSyncStore = create<SyncStore>(set => ({
  queue: 0,
  activeJobs: 0,
  remainingCredits: null,
  state: 'ok',
  backoffSeconds: null,
  setQueue: queue => set({ queue }),
  setActiveJobs: activeJobs => set({ activeJobs }),
  setRemainingCredits: remainingCredits => set({ remainingCredits }),
  setState: state => set({ state }),
  setBackoffSeconds: backoffSeconds => set({ backoffSeconds }),
}));
