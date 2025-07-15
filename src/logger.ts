import pino from 'pino';

/**
 * Centralised application logger.
 *
 * The log level defaults to `info` but can be overridden via the
 * `LOG_LEVEL` environment variable. Supported levels are `trace`,
 * `debug`, `info`, `warn`, `error` and `silent`.
 */
export function createLogger() {
  const level = (process.env.LOG_LEVEL || 'info') as pino.LevelWithSilent;
  return pino({ level, browser: { asObject: true } });
}

/** Shared logger instance used throughout the application. */
export const log = createLogger();
