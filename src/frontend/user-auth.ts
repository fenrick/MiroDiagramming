/**
 * Structure sent to the backend to register a Miro user.
 *
 * @property id - Unique identifier returned by Miro.
 * @property name - Display name of the user.
 * @property access_token - ID token proving user identity.
 * @property refresh_token - Token used to renew credentials.
 * @property expires_at - Expiration timestamp of the access token.
 */
import type { UserInfo } from './generated/user-info'
import { apiFetch } from './core/utils/api-fetch'

/** HTTP client for sending Miro auth details to the backend. */
export class AuthClient {
  public constructor(private readonly url = '/api/users') {}

  /**
   * Send authentication info to the server.
   *
   * @param details - User id, name and OAuth tokens.
   */
  public async register(details: UserInfo): Promise<void> {
    if (typeof fetch !== 'function') {
      return
    }

    const res = await apiFetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    })

    if (!res.ok) {
      throw new Error(`Registration failed with status ${res.status}`)
    }
  }

  /**
   * Attempt to register a user, retrying with exponential backoff on failure.
   *
   * @param details - User id, name and OAuth tokens.
   * @param attempts - Maximum number of tries.
   */
  public async registerWithRetry(details: UserInfo, attempts = 3): Promise<void> {
    for (let i = 0; i < attempts; i += 1) {
      try {
        await this.register(details)
        return
      } catch (err) {
        if (i === attempts - 1) {
          throw err
        }
        await new Promise((r) => setTimeout(r, 2 ** i * 1000))
      }
    }
  }
}

/**
 * Obtain the current Miro ID token and forward it to the server.
 *
 * @throws Error when the Miro SDK is unavailable.
 */
export async function registerWithCurrentUser(client = new AuthClient()): Promise<void> {
  if (
    typeof window === 'undefined' ||
    typeof (window as Window & { miro?: unknown }).miro === 'undefined'
  ) {
    console.warn('Miro SDK not loaded; are you opening index.html outside Miro?')
    return
  }
  if (!miro.board) {
    console.warn('Miro board API not available')
    return
  }
  const token = await miro.board.getIdToken()
  const user = await miro.board.getUserInfo()
  await client.registerWithRetry({
    id: String(user.id),
    name: user.name,
    access_token: token,
    refresh_token: '',
    expires_at: new Date().toISOString(),
  })
  // TODO: model the full OAuth exchange so tokens can be renewed via the server
  //       when they expire.
}
