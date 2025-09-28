/**
 * Centralised UI microcopy for the plugin.
 */

/** Text displayed in the sync bar for various states. */
export const syncBarText = {
  /** Idle state when all updates are persisted. */
  idle: 'All changes saved',
  /** Active state showing the number of queued changes. */
  syncing: (count: number): string => `Syncing ${count} changes…`,
  /** Throttled state approaching API limits. */
  nearLimit: 'Slowing to avoid API limits',
  /** Rate-limited state with automatic resume countdown. */
  rateLimited: (seconds: number): string => `Paused for ${seconds}s (auto-resume)`,
} as const

/** Labels for the apply button. */
export const applyButtonText = {
  /** Primary action showing pending change count. */
  primary: (count: number): string => `Apply ${count} change(s)`,
  /** Disabled state when no changes are pending. */
  disabled: 'No changes to apply',
} as const

/** User-friendly messages for API error toasts. */
export const errorToastText = {
  429: 'We\u2019re hitting the API limit. I\u2019ll retry shortly.',
  401: 'Miro session expired. Please sign in again.',
  500: 'Miro is having trouble. We\u2019ll retry in a moment.',
} as const

/**
 * Map HTTP status codes to an error toast message.
 *
 * @param status - Response status code from the server.
 * @returns Localised error message.
 */
export function getErrorToastMessage(status: number): string {
  if (status === 429) return errorToastText[429]
  if (status === 401) return errorToastText[401]
  if (status >= 500 && status < 600) {
    return errorToastText[500]
  }
  return 'An unexpected error occurred.'
}
