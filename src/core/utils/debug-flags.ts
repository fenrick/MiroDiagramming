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

const search = globalThis.location?.search ?? ''
const parameters = new URLSearchParams(search)

export const debugFlags: DebugFlags = import.meta.env.DEV
  ? {
      limits: parameters.get('debugLimits') ?? undefined,
      count429: parameters.get('debug429') ? Number(parameters.get('debug429')) : undefined,
    }
  : {}
