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
import { log } from '../../logger';

export async function showError(message: string): Promise<void> {
  const trimmed = message.length > 80 ? `${message.slice(0, 77)}...` : message;
  // Log the original message for troubleshooting and pass the trimmed version
  // to the Miro notification API.
  log.error(message);
  if (trimmed !== message) {
    log.debug('Trimmed long error message');
  }
  log.info('Showing error notification');
  await miro.board.notifications.showError(trimmed);
}
