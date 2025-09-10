/**
 * Configure Logfire for the browser and expose Pino‑style helpers.
 *
 * The rest of the codebase expects logging functions with the signature
 * `log.info(obj, msg)` where the structured attributes are provided first.
 * Logfire uses the opposite order.  To minimise churn, small wrappers are
 * exported that accept either calling convention and forward to Logfire.
 */
import {
  configure,
  info as lfInfo,
  debug as lfDebug,
  trace as lfTrace,
  warning as lfWarning,
  error as lfError,
} from 'logfire'

configure({
  sendToLogfire: import.meta.env.VITE_LOGFIRE_SEND_TO_LOGFIRE === 'true',
  serviceName: import.meta.env.VITE_LOGFIRE_SERVICE_NAME ?? 'miro-frontend',
  console: import.meta.env.DEV ?? true, // enable console in dev
})

type Attrs = Record<string, unknown> | undefined

function wrap(fn: (msg: string, attrs?: Attrs) => void) {
  return (a: string | Record<string, unknown>, b?: string | Record<string, unknown>) => {
    if (typeof a === 'string') {
      fn(a, b as Attrs)
    } else {
      fn(b as string, a)
    }
  }
}

export const info = wrap(lfInfo)
export const debug = wrap(lfDebug)
export const trace = wrap(lfTrace)
export const warning = wrap(lfWarning)
export const error = wrap(lfError)
