/**
 * Colour manipulation utilities for the currently selected widgets.
 */
import { colors } from '@mirohq/design-tokens'

import { adjustColor, ensureContrast, resolveColor } from '../core/utils/color-utilities'

import {
  type BoardLike,
  forEachSelection,
  getFirstSelection,
  maybeSync,
  type Syncable,
} from './board'

/**
 * Return the first style property present in the provided list.
 *
 * @param style - Style object to inspect.
 * @param keys - Ordered property names to check.
 * @returns The first key found or `null` when none match.
 */
export function findStyleKey(style: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    if (Object.hasOwn(style, key)) {
      return key
    }
  }
  return null
}

function readFill(style: Record<string, unknown>, key: 'fillColor' | 'backgroundColor'): string {
  const s = style as { fillColor?: unknown; backgroundColor?: unknown }
  if (key === 'fillColor') {
    return typeof s.fillColor === 'string' ? s.fillColor : resolveColor(colors.white, colors.white)
  }
  return typeof s.backgroundColor === 'string'
    ? s.backgroundColor
    : resolveColor(colors.white, colors.white)
}

function readFont(style: Record<string, unknown>, key: 'color' | 'textColor' | null): string {
  const s = style as { color?: unknown; textColor?: unknown }
  if (key === 'color') {
    return typeof s.color === 'string'
      ? s.color
      : resolveColor(colors['gray-700'], colors['gray-700'])
  }
  if (key === 'textColor') {
    return typeof s.textColor === 'string'
      ? s.textColor
      : resolveColor(colors['gray-700'], colors['gray-700'])
  }
  return resolveColor(colors['gray-700'], colors['gray-700'])
}

/** Retrieve the property name used for widget fill colour. */
function getFillKey(style: Record<string, unknown>): 'fillColor' | 'backgroundColor' | null {
  const s = style as { fillColor?: unknown; backgroundColor?: unknown }
  if (typeof s.fillColor === 'string') return 'fillColor'
  if (typeof s.backgroundColor === 'string') return 'backgroundColor'
  return null
}

/** Retrieve the property name used for widget font colour. */
function getFontKey(style: Record<string, unknown>): 'color' | 'textColor' | null {
  const s = style as { color?: unknown; textColor?: unknown }
  if (typeof s.color === 'string') return 'color'
  if (typeof s.textColor === 'string') return 'textColor'
  return null
}

/** Retrieve the property name used for widget opacity. */
function getOpacityKey(style: Record<string, unknown>): 'fillOpacity' | 'opacity' | null {
  const s = style as { fillOpacity?: unknown; opacity?: unknown }
  if (typeof s.fillOpacity === 'number') return 'fillOpacity'
  if (typeof s.opacity === 'number') return 'opacity'
  return null
}

function readOpacity(
  style: Record<string, unknown>,
  key: 'fillOpacity' | 'opacity',
): number | undefined {
  if (key === 'fillOpacity') {
    const v = (style as { fillOpacity?: unknown }).fillOpacity
    return typeof v === 'number' ? v : undefined
  }
  const v = (style as { opacity?: unknown }).opacity
  return typeof v === 'number' ? v : undefined
}

/** Retrieve the property name used for border width. */
function getBorderWidthKey(
  style: Record<string, unknown>,
): 'borderWidth' | 'strokeWidth' | 'lineWidth' | null {
  const s = style as { borderWidth?: unknown; strokeWidth?: unknown; lineWidth?: unknown }
  if (typeof s.borderWidth === 'number') return 'borderWidth'
  if (typeof s.strokeWidth === 'number') return 'strokeWidth'
  if (typeof s.lineWidth === 'number') return 'lineWidth'
  return null
}

function readBorderWidth(
  style: Record<string, unknown>,
  key: 'borderWidth' | 'strokeWidth' | 'lineWidth',
): number | undefined {
  if (key === 'borderWidth') {
    const v = (style as { borderWidth?: unknown }).borderWidth
    return typeof v === 'number' ? v : undefined
  }
  if (key === 'strokeWidth') {
    const v = (style as { strokeWidth?: unknown }).strokeWidth
    return typeof v === 'number' ? v : undefined
  }
  const v = (style as { lineWidth?: unknown }).lineWidth
  return typeof v === 'number' ? v : undefined
}

/**
 * Lighten or darken the fill colour of all selected widgets ensuring the
 * text colour maintains sufficient contrast.
 *
 * @param delta - Adjustment amount between -1 (darken) and 1 (lighten).
 * @param board - Optional board API overriding `miro.board` for testing.
 * @returns Resolves once all selected widgets are synchronised.
 */
export async function tweakFillColor(delta: number, board?: BoardLike): Promise<void> {
  await forEachSelection(async (item: Record<string, unknown>) => {
    const style = (item.style ?? {}) as Record<string, unknown>
    const fillKey = getFillKey(style)
    if (!fillKey) {
      return
    }
    const fontKey = getFontKey(style)
    const fill = readFill(style, fillKey)
    const font = readFont(style, fontKey)
    const newFill = adjustColor(fill, delta)
    if (fillKey === 'fillColor') {
      ;(style as { fillColor?: string }).fillColor = newFill
    } else {
      ;(style as { backgroundColor?: string }).backgroundColor = newFill
    }
    if (fontKey) {
      const contrasted = ensureContrast(newFill, font)
      if (fontKey === 'color') {
        ;(style as { color?: string }).color = contrasted
      } else {
        ;(style as { textColor?: string }).textColor = contrasted
      }
    }
    item.style = style
    await maybeSync(item as Syncable)
  }, board)
}

/**
 * Extract the fill colour from a widget style.
 *
 * @param item - Widget record possibly containing a style object.
 * @returns Hex colour string or `null` when unavailable.
 */
export function extractFillColor(item: Record<string, unknown> | undefined): string | null {
  if (!item) {
    return null
  }
  const style = (item.style ?? {}) as Record<string, unknown>
  const key = getFillKey(style)
  if (!key) {
    return null
  }
  if (key === 'fillColor') {
    const fill = (style as { fillColor?: unknown }).fillColor
    return typeof fill === 'string' ? resolveColor(fill, colors.white) : null
  }
  const bg = (style as { backgroundColor?: unknown }).backgroundColor
  return typeof bg === 'string' ? resolveColor(bg, colors.white) : null
}

/**
 * Retrieve the fill colour of the first selected widget.
 *
 * @param board - Optional board API overriding `miro.board` for testing.
 * @returns Hex colour string or `null` when unavailable.
 */
export async function copyFillFromSelection(board?: BoardLike): Promise<string | null> {
  const item = await getFirstSelection(board)
  return extractFillColor(item)
}

/**
 * Adjust opacity for all selected widgets.
 *
 * The function supports both `fillOpacity` and `opacity` properties and
 * clamps the resulting value to the 0–1 range.
 *
 * @param delta - Amount to add to the current opacity.
 * @param board - Optional board API overriding `miro.board` for testing.
 */
export async function tweakOpacity(delta: number, board?: BoardLike): Promise<void> {
  await forEachSelection(async (item: Record<string, unknown>) => {
    const style = (item.style ?? {}) as Record<string, unknown>
    const key = getOpacityKey(style)
    if (!key) {
      return
    }
    const current = readOpacity(style, key)
    if (typeof current !== 'number') {
      return
    }
    let next = current + delta
    next = Math.max(0, Math.min(1, next))
    if (key === 'fillOpacity') {
      ;(style as { fillOpacity?: number }).fillOpacity = next
    } else {
      ;(style as { opacity?: number }).opacity = next
    }
    item.style = style
    await maybeSync(item as Syncable)
  }, board)
}

/**
 * Modify border thickness for all selected widgets.
 *
 * Supports a variety of property names such as `borderWidth`,
 * `strokeWidth` or `lineWidth` and ensures values stay positive.
 *
 * @param delta - Amount to add to the current width in board units.
 * @param board - Optional board API overriding `miro.board` for testing.
 */
export async function tweakBorderWidth(delta: number, board?: BoardLike): Promise<void> {
  await forEachSelection(async (item: Record<string, unknown>) => {
    const style = (item.style ?? {}) as Record<string, unknown>
    const key = getBorderWidthKey(style)
    if (!key) {
      return
    }
    const current = readBorderWidth(style, key)
    if (typeof current !== 'number') {
      return
    }
    const next = Math.max(0, current + delta)
    if (key === 'borderWidth') {
      ;(style as { borderWidth?: number }).borderWidth = next
    } else if (key === 'strokeWidth') {
      ;(style as { strokeWidth?: number }).strokeWidth = next
    } else {
      ;(style as { lineWidth?: number }).lineWidth = next
    }
    item.style = style
    await maybeSync(item as Syncable)
  }, board)
}
