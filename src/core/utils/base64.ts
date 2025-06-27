/**
 * Encode a string as Base64URL in a UTF-8 safe manner.
 *
 * Uses `Buffer` when running in Node and falls back to
 * `btoa(unescape(encodeURIComponent()))` in the browser.
 *
 * @param input - Raw string to encode.
 * @returns Base64URL encoded representation.
 */
export function encodeBase64(input: string): string {
  const base64 =
    typeof Buffer !== 'undefined' &&
    (typeof window === 'undefined' || typeof window.btoa !== 'function')
      ? Buffer.from(input, 'utf8').toString('base64')
      : btoa(unescape(encodeURIComponent(input)));
  return base64.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
