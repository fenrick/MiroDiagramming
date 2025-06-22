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
export async function showError(message: string): Promise<void> {
  const trimmed = message.length > 80 ? `${message.slice(0, 77)}...` : message;
  // Log the original message to the browser console for troubleshooting.
  // The raw message is logged to preserve detail, while the trimmed version is
  // passed to the Miro notification API.
  // eslint-disable-next-line no-console
  console.error(message);
  await miro.board.notifications.showError(trimmed);
}

/**
 * Display an informational message via Miro's notification system.
 * Messages are truncated to 80 characters which satisfies SDK limits.
 *
 * @param message - The text to display.
 */
export async function showInfo(message: string): Promise<void> {
  const trimmed = message.length > 80 ? `${message.slice(0, 77)}...` : message;
  await miro.board.notifications.showInfo(trimmed);
}
