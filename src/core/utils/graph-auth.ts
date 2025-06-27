/**
 * Simple OAuth helper for acquiring Microsoft Graph access tokens.
 *
 * The class stores the token in `sessionStorage` and redirects the
 * browser to the Microsoft login page when no token is available.
 */
export class GraphAuth {
  private static readonly KEY = 'graph.token';

  /** Get the currently stored access token. */
  public getToken(): string | null {
    return sessionStorage.getItem(GraphAuth.KEY);
  }

  /** Manually store an access token. */
  public setToken(token: string): void {
    sessionStorage.setItem(GraphAuth.KEY, token);
  }

  /** Remove any stored token. */
  public clearToken(): void {
    sessionStorage.removeItem(GraphAuth.KEY);
  }

  /**
   * Begin the OAuth implicit flow by redirecting the user.
   *
   * @param clientId - Azure application client identifier.
   * @param scopes - Space separated list of scopes.
   * @param redirectUri - URI configured as an app redirect.
   */
  public login(clientId: string, scopes: string[], redirectUri: string): void {
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'token',
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
    });
    window.location.assign(
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`,
    );
  }

  /**
   * Complete the OAuth redirect by extracting the token from the hash.
   */
  public handleRedirect(): void {
    if (!window.location.hash.includes('access_token')) return;
    const data = new URLSearchParams(window.location.hash.slice(1));
    const token = data.get('access_token');
    if (token) {
      this.setToken(token);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }
}

export const graphAuth = new GraphAuth();
