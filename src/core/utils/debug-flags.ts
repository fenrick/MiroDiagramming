/**
 * Parse debug toggles from the current URL.
 *
 * These flags enable developer-only behaviours when running a dev build.
 */
export interface DebugFlags {
  /** Force the API limits endpoint to return a near limit response. */
  limits?: string
  /** Number of subsequent operations that should return HTTP 429. */
  count429?: number
}

const search = (() => {
  const globalContext = globalThis as typeof globalThis & {
    location?: { search?: string }
  }

  if (!Object.prototype.hasOwnProperty.call(globalContext, 'location')) {
    return ''
  }

  const locationValue = globalContext.location as { search?: string }
  return typeof locationValue.search === 'string' ? locationValue.search : ''
})()

const parameters = new URLSearchParams(search)

const limitsParameter = parameters.get('debugLimits')
let limits: string | undefined
if (limitsParameter !== null) {
  limits = limitsParameter
}

const count429Parameter = parameters.get('debug429')
let count429: number | undefined
if (count429Parameter !== null) {
  const parsed = Number.parseInt(count429Parameter, 10)
  if (!Number.isNaN(parsed)) {
    count429 = parsed
  }
}

export const debugFlags: DebugFlags = (() => {
  if (!import.meta.env.DEV) {
    return {}
  }

  const result: DebugFlags = {}
  if (limits !== undefined) {
    result.limits = limits
  }
  if (count429 !== undefined) {
    result.count429 = count429
  }
  return result
})()
