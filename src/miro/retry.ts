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
      const backoff = baseDelayMs * 2 ** i
      await delay(backoff)
    }
  }
  // Should never reach here
  throw new Error('exhausted retries')
}
