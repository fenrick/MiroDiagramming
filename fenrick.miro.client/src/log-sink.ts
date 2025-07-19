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

  public async store(entries: ClientLogEntry[]): Promise<void> {
    if (process.env.NODE_ENV === 'test' || typeof fetch !== 'function') return;
    try {
      await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      });
    } catch {
      /* avoid crashing on network errors */
    }
  }
}
