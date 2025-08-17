import { context, propagation } from '@opentelemetry/api';
import { span } from 'logfire';
import { debugFlags } from './debug-flags';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? '';

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
  return span('api fetch', async () => {
    const user = await miro.board.getUserInfo();
    const headers = new Headers(init.headers || {});
    headers.set('X-User-Id', String(user.id));
    propagation.inject(context.active(), headers, {
      set: (key, value) => headers.set(key, value),
    });
    if (import.meta.env.DEV) {
      if (debugFlags.limits) {
        headers.set('X-Debug-Limits', debugFlags.limits);
      }
      if (debugFlags.auth) {
        headers.set('X-Debug-Auth', debugFlags.auth);
      }
      if (debugFlags.count429 !== undefined) {
        headers.set('X-Debug-429', String(debugFlags.count429));
        delete debugFlags.count429;
      }
    }
    const url = typeof input === 'string' ? `${API_BASE_URL}${input}` : input;
    return fetch(url, { ...init, headers });
  });
}
