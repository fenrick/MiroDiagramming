const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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
  const url = typeof input === 'string' ? `${API_BASE_URL}${input}` : input;
  return fetch(url, { ...init, headers });
}
