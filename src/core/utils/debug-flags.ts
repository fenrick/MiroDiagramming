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

const params = new URLSearchParams(window.location.search)

export const debugFlags: DebugFlags = import.meta.env.DEV
  ? {
      limits: params.get('debugLimits') ?? undefined,
      count429: params.get('debug429') ? Number(params.get('debug429')) : undefined,
    }
  : {}
