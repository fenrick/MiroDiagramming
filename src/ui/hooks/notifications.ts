/**
 * Utility wrappers around the Miro notification API.
 */

/**
 * Display an error message via Miro's notification system and log it to the
 * console. Messages longer than 80 characters are truncated to satisfy SDK
 * validation requirements before being sent to Miro's UI.
 *
 * @param message - The text to display.
 */
import * as log from '../../logger'
import { getErrorToastMessage } from '../microcopy'
import { pushToast } from '../components/Toast'

export async function showError(message: string): Promise<void> {
  const trimmed = message.length > 80 ? `${message.slice(0, 77)}...` : message
  // Log the original message for troubleshooting and pass the trimmed version
  // to the Miro notification API.
  log.error(message)
  if (trimmed !== message) {
    log.debug('Trimmed long error message')
  }
  log.info('Showing error notification')
  pushToast({ message: trimmed })
}

/**
 * Display a standardised error message for a given HTTP status code.
 *
 * @param status - HTTP status returned from an API request.
 */
export async function showApiError(status: number): Promise<void> {
  const message = getErrorToastMessage(status)
  await showError(message)
}
