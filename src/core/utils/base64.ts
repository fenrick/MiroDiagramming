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
  const hasBuffer = typeof Buffer !== 'undefined'
  const hasBtoa = typeof globalThis.btoa === 'function'
  const base64 = (() => {
    if (hasBuffer && !hasBtoa) {
      return Buffer.from(input, 'utf8').toString('base64')
    }

    const bytes = new TextEncoder().encode(input)
    let binary = ''
    for (const byte of bytes) {
      binary += String.fromCodePoint(byte)
    }

    if (hasBtoa) {
      return globalThis.btoa(binary)
    }

    if (hasBuffer) {
      return Buffer.from(binary, 'binary').toString('base64')
    }

    throw new Error('No Base64 encoder available')
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
  const hasBuffer = typeof Buffer !== 'undefined'
  const hasAtob = typeof globalThis.atob === 'function'

  if (hasBuffer && !hasAtob) {
    return Buffer.from(padded, 'base64').toString('utf8')
  }

  const binary = (() => {
    if (hasAtob) {
      return globalThis.atob(padded)
    }

    if (hasBuffer) {
      return Buffer.from(padded, 'base64').toString('binary')
    }

    throw new Error('No Base64 decoder available')
  })()

  const bytes = Uint8Array.from(binary, (char) => char.codePointAt(0) ?? 0)
  return new TextDecoder().decode(bytes)
}
