import type { LoggerOptions } from 'pino'

import { loadEnv } from './env.js'

export function getLoggerOptions(): LoggerOptions {
  const env = loadEnv()
  const isProd = env.NODE_ENV === 'production'
  return {
    level: env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
    transport: isProd
      ? undefined
      : {
          target: 'pino-pretty',
          options: { translateTime: 'SYS:standard', colorize: true, singleLine: true },
        },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["x-miro-signature"]',
        'miro.*',
        'tokens.*',
      ],
      censor: '[Redacted]',
    },
  }
}
