/**
 * Structure sent to the backend to register a Miro user.
 *
 * @property id - Unique identifier returned by Miro.
 * @property name - Display name of the user.
 * @property token - OAuth token scoped for REST API calls.
 */
export interface AuthDetails {
  id: string;
  name: string;
  token: string;
}

/** HTTP client for sending Miro auth details to the backend. */
export class AuthClient {
  public constructor(private readonly url = '/api/users') {}

  /**
   * Send authentication info to the server.
   *
   * @param details - User id, name and OAuth token.
   */
  public async register(details: AuthDetails): Promise<void> {
    if (typeof fetch !== 'function') {
      return;
    }
    await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
  }
}

/**
 * Obtain the current Miro token and forward it to the server.
 *
 * @throws Error when the Miro SDK is unavailable.
 */
export async function registerCurrentUser(
  client = new AuthClient(),
): Promise<void> {
  if (typeof miro === 'undefined' || !miro.board) {
    throw new Error('Miro SDK not available');
  }
  const token = await miro.board.getIdToken();
  const user = await miro.board.getUserInfo();
  await client.register({ id: String(user.id), name: user.name, token });
  // TODO: handle registration failures and retry strategy.
}
