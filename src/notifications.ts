/**
 * Utility wrappers around the Miro notification API.
 */

/**
 * Display an error message via Miro's notification system. Messages
 * longer than 80 characters are truncated to satisfy SDK validation
 * requirements.
 *
 * @param message - The text to display.
 */
export function showError(message: string): void {
  const trimmed = message.length > 80 ? `${message.slice(0, 77)}...` : message;
  miro.board.notifications.showError(trimmed);
}
