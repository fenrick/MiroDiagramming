/* eslint-disable no-console */
/**
 * Lightweight console-backed logger for the browser.
 *
 * The rest of the codebase expects logging functions with the signature
 * `log.info(obj, msg)` where the structured attributes are provided first.
 * These wrappers preserve that call style while emitting logs to the browser
 * console so local development remains observable without pulling in the
 * server-oriented Logfire dependency.
 */

type Attrs = Record<string, unknown> | undefined

const SERVICE = import.meta.env.VITE_LOGFIRE_SERVICE_NAME ?? 'miro-frontend'
const ENABLE_CONSOLE = (import.meta.env.VITE_LOGFIRE_SEND_TO_LOGFIRE ?? 'false') !== 'true'

function log(level: 'info' | 'debug' | 'trace' | 'warn' | 'error', message: string, attrs?: Attrs) {
  if (!ENABLE_CONSOLE) {
    return
  }
  const payload = attrs && Object.keys(attrs).length > 0 ? attrs : undefined
  const prefix = `[${SERVICE}] ${message}`
  switch (level) {
    case 'info':
      if (payload) {
        console.info(prefix, payload)
      } else {
        console.info(prefix)
      }
      break
    case 'debug':
    case 'trace':
      if (payload) {
        console.debug(prefix, payload)
      } else {
        console.debug(prefix)
      }
      break
    case 'warn':
      if (payload) {
        console.warn(prefix, payload)
      } else {
        console.warn(prefix)
      }
      break
    case 'error':
      if (payload) {
        console.error(prefix, payload)
      } else {
        console.error(prefix)
      }
      break
    default:
      if (payload) {
        console.log(prefix, payload)
      } else {
        console.log(prefix)
      }
      break
  }
}

function wrap(level: 'info' | 'debug' | 'trace' | 'warn' | 'error') {
  return (a: string | Record<string, unknown>, b?: string | Record<string, unknown>) => {
    if (typeof a === 'string') {
      log(level, a, b as Attrs)
    } else {
      log(level, b as string, a)
    }
  }
}

export const info = wrap('info')
export const debug = wrap('debug')
export const trace = wrap('trace')
export const warning = wrap('warn')
export const error = wrap('error')
