/**
 * Lightweight console-backed logger for the browser.
 *
 * The rest of the codebase expects logging functions with the signature
 * `log.info(obj, msg)` where the structured attributes are provided first.
 * These wrappers preserve that call style while emitting logs to the browser
 * console so local development remains observable without pulling in the
 * server-oriented Logfire dependency.
 */

type Attributes = Record<string, unknown>

const SERVICE = String(import.meta.env.VITE_LOGFIRE_SERVICE_NAME ?? 'miro-frontend')
const ENABLE_CONSOLE = String(import.meta.env.VITE_LOGFIRE_SEND_TO_LOGFIRE ?? 'false') !== 'true'

type Level = 'info' | 'debug' | 'trace' | 'warn' | 'error'

function getConsoleMethod(
  level: Level,
): (message?: unknown, ...optionalParameters: unknown[]) => void {
  switch (level) {
    case 'info': {
      return console.info.bind(console)
    }
    case 'debug': {
      return console.debug.bind(console)
    }
    case 'trace': {
      return console.debug.bind(console)
    }
    case 'warn': {
      return console.warn.bind(console)
    }
    case 'error': {
      return console.error.bind(console)
    }
    default: {
      return console.log.bind(console)
    }
  }
}

const isAttributes = (value: unknown): value is Attributes =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const normaliseMessage = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return ''
}

function log(level: Level, message: string, attributes?: Attributes) {
  if (!ENABLE_CONSOLE) {
    return
  }
  const payload = attributes && Object.keys(attributes).length > 0 ? attributes : undefined
  const prefix = `[${SERVICE}] ${message}`
  const emit = getConsoleMethod(level)
  if (payload) {
    emit(prefix, payload)
  } else {
    emit(prefix)
  }
}

function wrap(level: Level) {
  return (
    messageOrAttributes: string | Attributes,
    maybeAttributesOrMessage?: string | Attributes,
  ) => {
    if (typeof messageOrAttributes === 'string') {
      const attributes = isAttributes(maybeAttributesOrMessage)
        ? maybeAttributesOrMessage
        : undefined
      log(level, messageOrAttributes, attributes)
      return
    }

    if (typeof maybeAttributesOrMessage === 'string') {
      log(level, maybeAttributesOrMessage, messageOrAttributes)
      return
    }

    log(level, normaliseMessage(maybeAttributesOrMessage), messageOrAttributes)
  }
}

export const info = wrap('info')
export const debug = wrap('debug')
export const trace = wrap('trace')
export const warning = wrap('warn')
export const error = wrap('error')
