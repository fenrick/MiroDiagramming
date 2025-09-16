import { setTimeout as delay } from 'node:timers/promises'

/**
 * Wraps a Miro API call with retry logic for 429 and 5xx errors.
 * Retries use exponential backoff capped by the provided attempts.
 */
export async function withMiroRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  baseDelayMs = 200,
): Promise<T> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn()
    } catch (err) {
      const status = (err as { status?: number })?.status
      const retriable = status === 429 || (status !== undefined && status >= 500 && status < 600)
      if (!retriable || i === attempts - 1) {
        throw err
      }
      // Respect Retry-After header if present (seconds or HTTP-date)
      const headers = (err as { headers?: Record<string, unknown> })?.headers || {}
      const retryAfter = headers['retry-after'] as string | number | undefined
      let waitMs: number | undefined
      if (retryAfter !== undefined) {
        if (typeof retryAfter === 'number') {
          waitMs = retryAfter * 1000
        } else if (/^\d+(?:\.\d+)?$/.test(retryAfter)) {
          waitMs = Math.ceil(parseFloat(retryAfter) * 1000)
        } else if (!Number.isNaN(Date.parse(retryAfter))) {
          waitMs = Math.max(0, Date.parse(retryAfter) - Date.now())
        }
      }
      // Fallback to exponential backoff with small jitter
      if (waitMs === undefined) {
        const base = baseDelayMs * 2 ** i
        const jitter = Math.floor(Math.random() * Math.min(100, base))
        waitMs = base + jitter
      }
      await delay(waitMs)
    }
  }
  // Should never reach here
  throw new Error('exhausted retries')
}
