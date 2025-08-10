import { apiFetch } from './core/utils/api-fetch';

export interface ClientLogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, string>;
}

export interface LogSink {
  store(entries: ClientLogEntry[]): Promise<void>;
}

/**
 * HTTP implementation of {@link LogSink}.
 *
 * Batches are posted as JSON to `/api/logs`.
 */
export class HttpLogSink implements LogSink {
  public constructor(private readonly url = '/api/logs') {}
  /**
   * Sends client log entries to the backend.
   *
   * @param entries - log entries to persist
   */
  public async store(entries: ClientLogEntry[]): Promise<void> {
    if (process.env.NODE_ENV === 'test' || typeof fetch !== 'function') {
      return;
    }
    try {
      const response = await apiFetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      });
      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.warn(
          `HttpLogSink received unexpected status: ${response.status}`,
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('HttpLogSink failed to store log entries', error);
      /* avoid crashing on network errors */
    }
  }
}
