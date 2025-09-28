/**
 * Encode a string as Base64URL in a UTF-8 safe manner.
 *
 * Uses `Buffer` when running in Node and falls back to
 * a `TextEncoder`-based implementation in the browser.
 *
 * @param input - Raw string to encode.
 * @returns Base64URL encoded representation.
 */
export function encodeBase64(input: string): string {
  const base64 =
    typeof Buffer !== 'undefined' &&
    (globalThis.window === undefined || typeof globalThis.btoa !== 'function')
      ? Buffer.from(input, 'utf8').toString('base64')
      : (() => {
          const bytes = new TextEncoder().encode(input)
          let binary = ''
          for (const byte of bytes) {
            binary += String.fromCharCode(byte)
          }
          return btoa(binary)
        })()
  let sanitized = base64
  while (sanitized.endsWith('=')) {
    sanitized = sanitized.slice(0, -1)
  }
  sanitized = sanitized.split('+').join('-')
  sanitized = sanitized.split('/').join('_')
  return sanitized
}

/**
 * Decode a Base64URL string to UTF-8.
 *
 * @param input - Base64URL encoded data.
 * @returns Decoded string.
 */
export function decodeBase64(input: string): string {
  const normalized = input.split('-').join('+').split('_').join('/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  if (
    typeof Buffer !== 'undefined' &&
    (globalThis.window === undefined || typeof globalThis.atob !== 'function')
  ) {
    return Buffer.from(padded, 'base64').toString('utf8')
  }
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}
