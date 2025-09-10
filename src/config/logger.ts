import pino from 'pino'

export function createLogger() {
  const isProd = process.env.NODE_ENV === 'production'
  return pino({
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
  })
}

export type Logger = ReturnType<typeof createLogger>
