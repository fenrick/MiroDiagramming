import type { FastifyInstance } from 'fastify'
import closeWithGrace from 'close-with-grace'

export interface GracefulShutdownOptions {
  /**
   * Maximum time to wait for the process to close before forcing exit.
   * Mirrors the default delay used by `close-with-grace` which terminates the
   * process after 10 seconds if cleanup has not completed.
   */
  timeoutMs?: number | null | false
  /**
   * Allow tests to inject a stubbed `close-with-grace` implementation.
   */
  closeWithGraceFn?: typeof closeWithGrace
}

/**
 * Wire the Fastify instance into the `close-with-grace` helper so that
 * termination signals (SIGTERM/SIGINT, uncaught exceptions, etc.) result in a
 * coordinated shutdown. The helper handles double-signal safety and exits the
 * process with the correct status code once `app.close()` resolves.
 */
export function registerGracefulShutdown(
  app: FastifyInstance,
  { timeoutMs = 10_000, closeWithGraceFn = closeWithGrace }: GracefulShutdownOptions = {},
) {
  const handler = async ({
    err,
    signal,
    manual,
  }: {
    err?: Error
    signal?: NodeJS.Signals
    manual?: boolean
  }) => {
    if (err) {
      app.log.error({ err }, 'server closing after fatal error')
    } else if (signal) {
      app.log.info({ signal }, 'received termination signal; closing server')
    } else if (manual) {
      app.log.info('closing server (manual trigger)')
    } else {
      app.log.info('closing server')
    }

    try {
      await app.close()
    } finally {
      listeners.uninstall()
    }
  }

  const listeners = closeWithGraceFn({ delay: timeoutMs }, handler)

  return listeners
}
