import { error as logError, warning as logWarning } from '../logger';

interface BaseEvent {
  readonly type: string;
  readonly [key: string]: unknown;
}

export interface DiffShownEvent extends BaseEvent {
  type: 'diff_shown';
  creates: number;
  updates: number;
  deletes: number;
  boardId: string;
}

export interface BatchSubmittedEvent extends BaseEvent {
  type: 'batch_submitted';
  jobId: string;
  count: number;
}

export interface JobCompletedEvent extends BaseEvent {
  type: 'job_completed';
  jobId: string;
  durationMs: number;
  successCount: number;
  failCount: number;
}

export interface RateLimitEncounteredEvent extends BaseEvent {
  type: 'rate_limit_encountered';
  retryAfterMs: number;
}

export interface OauthPromptShownEvent extends BaseEvent {
  type: 'oauth_prompt_shown';
}

export interface OauthCompletedEvent extends BaseEvent {
  type: 'oauth_completed';
}

export type TelemetryEvent =
  | DiffShownEvent
  | BatchSubmittedEvent
  | JobCompletedEvent
  | RateLimitEncounteredEvent
  | OauthPromptShownEvent
  | OauthCompletedEvent;

/**
 * Sends telemetry events to the backend logging endpoint.
 *
 * @param event - event payload without personally identifiable information
 */
async function post(event: TelemetryEvent): Promise<void> {
  if (process.env.NODE_ENV === 'test' || typeof fetch !== 'function') {
    return;
  }
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: event.type,
      context: { ...event },
    };
    delete entry.context.type;
    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([entry]),
    });
    if (!response.ok) {
      logWarning('telemetry post failed', { status: response.status });
    }
  } catch (error) {
    logError('telemetry post threw', { error });
  }
}

/**
 * Records the counts of created, updated and deleted items in a diff view.
 *
 * @param params - diff statistics including the owning board identifier
 */
export async function diffShown(
  params: Omit<DiffShownEvent, 'type'>,
): Promise<void> {
  await post({ type: 'diff_shown', ...params });
}

/**
 * Notes submission of a batch job for processing.
 *
 * @param params - identifier and item count for the job
 */
export async function batchSubmitted(
  params: Omit<BatchSubmittedEvent, 'type'>,
): Promise<void> {
  await post({ type: 'batch_submitted', ...params });
}

/**
 * Captures completion statistics for an asynchronous job.
 *
 * @param params - identifiers and outcome counts for the job
 */
export async function jobCompleted(
  params: Omit<JobCompletedEvent, 'type'>,
): Promise<void> {
  await post({ type: 'job_completed', ...params });
}

/**
 * Registers that the client hit a server rate limit.
 *
 * @param params - retry delay reported by the server in milliseconds
 */
export async function rateLimitEncountered(
  params: Omit<RateLimitEncounteredEvent, 'type'>,
): Promise<void> {
  await post({ type: 'rate_limit_encountered', ...params });
}

/**
 * Tracks display of the OAuth consent prompt.
 */
export async function oauthPromptShown(): Promise<void> {
  await post({ type: 'oauth_prompt_shown' });
}

/**
 * Tracks successful completion of OAuth consent.
 */
export async function oauthCompleted(): Promise<void> {
  await post({ type: 'oauth_completed' });
}
