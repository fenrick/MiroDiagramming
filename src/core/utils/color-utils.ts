/**
 * Color manipulation utilities used by the Style tools.
 *
 * These helpers provide lightening/darkening adjustments and
 * contrast calculations so fill and font colours remain readable.
 */

import { colors } from '@mirohq/design-tokens'

/** Convert a token reference to its hex value. */
export function resolveColor(token: string, fallback: string): string {
  if (token.startsWith('var(')) {
    if (typeof document !== 'undefined') {
      const name = token.slice(4, -1)
      const val = getComputedStyle(document.documentElement).getPropertyValue(name)
      return (val.trim() || fallback).toLowerCase()
    }
    return fallback.toLowerCase()
  }
  return token.toLowerCase()
}

/** RGB colour representation. */
export interface Rgb {
  r: number
  g: number
  b: number
}

/** Convert a hex colour string to RGB components. */
export function hexToRgb(hex: string): Rgb {
  const n = hex.replace('#', '')
  const int = Number.parseInt(n, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

/** Convert RGB colour components to a hex string. */
export function rgbToHex(rgb: Rgb): string {
  const toHex = (v: number): string => v.toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

/**
 * Adjust a colour towards white or black.
 *
 * @param hex - Original colour in `#rrggbb` format.
 * @param amount - Range -1 to 1 where negative darkens and positive lightens.
 * @returns The adjusted colour as a hex string.
 */
export function adjustColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  const t = amount < 0 ? 0 : 255
  const p = Math.abs(amount)
  return rgbToHex({
    r: Math.round((t - rgb.r) * p + rgb.r),
    g: Math.round((t - rgb.g) * p + rgb.g),
    b: Math.round((t - rgb.b) * p + rgb.b),
  })
}

/** Calculate the relative luminance of an RGB colour. */
export function luminance(rgb: Rgb): number {
  const toLinear = (v: number): number => {
    const n = v / 255
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
}

/** Compute contrast ratio between two colours. */
export function contrastRatio(a: string, b: string): number {
  const l1 = luminance(hexToRgb(a))
  const l2 = luminance(hexToRgb(b))
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

/**
 * Ensure the foreground colour is readable against the background.
 *
 * If the provided colour fails the 4.5:1 ratio, black or white is chosen
 * based on whichever has the highest contrast.
 */
export function ensureContrast(bg: string, fg: string): string {
  if (contrastRatio(bg, fg) >= 4.5) {
    return fg
  }
  const black = contrastRatio(bg, resolveColor(colors.black, colors.black))
  const white = contrastRatio(bg, resolveColor(colors.white, colors.white))
  return black >= white
    ? resolveColor(colors.black, colors.black)
    : resolveColor(colors.white, colors.white)
}

/**
 * Blend two colours by linearly mixing their RGB values.
 *
 * @param a - Hex colour string used as the base.
 * @param b - Hex colour string that is mixed in.
 * @param weight - Amount of colour `b` from 0 to 1.
 * @returns Hex colour between `a` and `b`.
 */
export function mixColors(a: string, b: string, weight: number): string {
  const w = Math.min(Math.max(weight, 0), 1)
  const rgbA = hexToRgb(a)
  const rgbB = hexToRgb(b)
  const mix = (va: number, vb: number): number => Math.round(va * (1 - w) + vb * w)
  return rgbToHex({
    r: mix(rgbA.r, rgbB.r),
    g: mix(rgbA.g, rgbB.g),
    b: mix(rgbA.b, rgbB.b),
  })
}
