import React from 'react';
import { apiFetch } from '../utils/api-fetch';

export type JobOpStatus = 'pending' | 'working' | 'done' | 'failed';

/**
 * Operation within an asynchronous job.
 */
export interface JobOperation {
  /** Identifier of the operation. */
  id: string;
  /** Current status. */
  status: JobOpStatus;
  /** Optional human readable message. */
  message?: string;
}

export type JobStatus = JobOpStatus | 'partial';

/**
 * Job containing multiple operations that run asynchronously.
 */
export interface Job {
  /** Server generated job identifier. */
  id: string;
  /** Overall status for the job. */
  status: JobStatus;
  /** Operations that compose the job. */
  operations: JobOperation[];
}

const jobCache = new Map<string, Job>();

/**
 * Poll the backend for the status of a job.
 *
 * Results are cached per job id so duplicate requests return instantly.
 *
 * @param jobId - Identifier returned when creating the job.
 * @returns The latest job information or `undefined` if not yet available.
 */
export function useJob(jobId: string): Job | undefined {
  const [job, setJob] = React.useState<Job | undefined>(() =>
    jobCache.get(jobId),
  );

  React.useEffect(() => {
    let cancelled = false;

    async function poll(): Promise<void> {
      try {
        const res = await apiFetch(`/api/jobs/${jobId}`);
        const data = (await res.json()) as Job;
        jobCache.set(jobId, data);
        if (!cancelled) {
          setJob(data);
          if (data.status === 'pending' || data.status === 'working') {
            setTimeout(poll, 1000);
          }
        }
      } catch {
        /* intentionally ignore network errors */
      }
    }

    if (!job || job.status === 'pending' || job.status === 'working') {
      poll();
    }

    return () => {
      cancelled = true;
    };
  }, [jobId, job]);

  return job;
}
