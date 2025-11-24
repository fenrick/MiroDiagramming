const FALLBACKS = {
  black: '#000000',
  white: '#ffffff',
  'gray-700': '#343741',
  'alpha-black-400': 'rgba(0, 0, 0, 0.4)',
  'green-700': '#154b08',
  'red-700': '#6b1720',
} as const

const CSS_PREFIX = '--colors-'

const readCssVariable = (token: string): string | undefined => {
  if (typeof document === 'undefined') return undefined
  const value = getComputedStyle(document.documentElement).getPropertyValue(`${CSS_PREFIX}${token}`)
  return value.trim() || undefined
}

/**
 * Resolve a colour token to a usable CSS value.
 *
 * Looks up the mirotone CSS variable first, then falls back to a small
 * curated palette, and finally returns the token string untouched.
 */
/* eslint-disable security/detect-possible-timing-attacks */
export function getColor(token: string, fallback?: string): string {
  const cssValue = readCssVariable(token)
  if (cssValue) return cssValue
  if (token === 'black') return FALLBACKS.black
  if (token === 'white') return FALLBACKS.white
  if (token === 'gray-700') return FALLBACKS['gray-700']
  if (token === 'alpha-black-400') return FALLBACKS['alpha-black-400']
  if (token === 'green-700') return FALLBACKS['green-700']
  if (token === 'red-700') return FALLBACKS['red-700']
  return fallback ?? token
}
/* eslint-enable security/detect-possible-timing-attacks */
