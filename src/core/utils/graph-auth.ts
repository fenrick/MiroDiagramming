/**
 * Simple OAuth helper for acquiring Microsoft Graph access tokens.
 *
 * The class stores the token in `sessionStorage` and redirects the
 * browser to the Microsoft login page when no token is available.
 */
export class GraphAuth {
  private static readonly KEY = 'graph.token';
  private static readonly STATE = 'graph.state';

  /**
   * Generate and persist a cryptographically secure state token used for OAuth
   * validation.
   *
   * @returns Newly created state value.
   */
  public generateState(): string {
    const state = crypto.randomUUID();
    sessionStorage.setItem(GraphAuth.STATE, state);
    return state;
  }

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
   * @remarks Generates a random state value stored in sessionStorage.
   */
  public login(clientId: string, scopes: string[], redirectUri: string): void {
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'token',
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      state: this.generateState(),
    });
    window.location.assign(
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`,
    );
  }

  /**
   * Complete the OAuth redirect by extracting and validating the token.
   * The state parameter stored during {@link login} must match or the
   * token is discarded to mitigate CSRF attacks.
   */
  public handleRedirect(): void {
    if (!window.location.hash.includes('access_token')) return;
    const data = new URLSearchParams(window.location.hash.slice(1));
    const token = data.get('access_token');
    const state = data.get('state');
    const stored = sessionStorage.getItem(GraphAuth.STATE);
    if (token && state && stored === state) {
      this.setToken(token);
      sessionStorage.removeItem(GraphAuth.STATE);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }
}

export const graphAuth = new GraphAuth();
