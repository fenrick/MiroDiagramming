/**
 * Utility functions that guard against prototype pollution by validating
 * dynamic object keys before they are used for property access.
 */

const BLOCKED_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

/**
 * Determine whether the provided value is a safe key for object access.
 *
 * @param candidate - Value that will be used as an object key.
 * @param validator - Optional predicate enforcing additional constraints.
 * @returns The candidate when safe, otherwise `undefined`.
 */
export function sanitizeObjectKey(
  candidate: unknown,
  validator?: (value: string) => boolean,
): string | undefined {
  if (typeof candidate !== 'string') {
    return undefined
  }
  if (BLOCKED_KEYS.has(candidate) || candidate.includes('__proto__')) {
    return undefined
  }
  if (validator && !validator(candidate)) {
    return undefined
  }
  return candidate
}

/** Allow CSS-style property names (lowercase letters and hyphen). */
export const isSafeCssProperty = (value: string): boolean => /^[a-z-]+$/.test(value)

/** Allow standard lookup identifiers composed of alphanumerics and separators. */
export const isSafeLookupKey = (value: string): boolean => /^[\w.-]+$/.test(value)

/** Allow user-facing aliases consisting of letters, digits, spaces and separators. */
export const isSafeAliasKey = (value: string): boolean => /^[\w .-]+$/.test(value)

/** Allow class names emitted by Mermaid (letters, digits, dash or underscore). */
export const isSafeClassName = (value: string): boolean => /^[\w-]+$/.test(value)

/** Allow style property identifiers (camelCase or kebab-case). */
export const isSafeStyleProperty = (value: string): boolean => /^[a-z][\w-]*$/i.test(value)
