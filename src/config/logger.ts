import pino, { type LoggerOptions } from 'pino'

export function getLoggerOptions(): LoggerOptions {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
    transport: isProd
      ? undefined
      : {
          target: 'pino-pretty',
          options: { translateTime: 'SYS:standard', colorize: true, singleLine: true },
        },
    redact: {
      paths: ['req.headers.authorization', 'miro.*', 'tokens.*'],
      remove: true,
    },
  }
}

export function createLogger() {
  return pino(getLoggerOptions())
}

export type Logger = ReturnType<typeof createLogger>
