import pino from 'pino';
import type { LogSink, ClientLogEntry } from './log-sink';
import { HttpLogSink } from './log-sink';

/**
 * Centralised application logger.
 *
 * The log level defaults to `info` but can be overridden via the
 * `LOG_LEVEL` environment variable. Supported levels are `trace`,
 * `debug`, `info`, `warn`, `error` and `silent`.
 */
export function createLogger(sink?: LogSink) {
  const level = (process.env.LOG_LEVEL || 'info') as pino.LevelWithSilent;
  return pino({
    level,
    browser: { asObject: true },
    hooks: sink
      ? {
          logMethod(args, method, lvl) {
            method.apply(this, args);
            const [msg, ctx] = args;
            const labels = this.levels.labels;
            const name = labels[lvl] ?? 'info';
            const entry: ClientLogEntry = {
              timestamp: new Date().toISOString(),
              level: name,
              message: String(msg),
              context: ctx as Record<string, string> | undefined,
            };
            void sink.store([entry]);
          },
        }
      : undefined,
  });
}

/** Shared logger instance used throughout the application. */
export const log = createLogger(new HttpLogSink());
