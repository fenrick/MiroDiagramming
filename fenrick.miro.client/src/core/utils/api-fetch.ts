/**
 * Augment fetch calls with the current user's identifier.
 *
 * @param input - Request URL or object.
 * @param init - Fetch options.
 * @returns Response from the server.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const user = await miro.board.getUserInfo();
  const headers = new Headers(init.headers || {});
  headers.set('X-User-Id', String(user.id));
  return fetch(input, { ...init, headers });
}
