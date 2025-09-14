import { resolveColor } from '../core/utils/color-utils'
import type { StylePreset } from '../ui/style-presets'

import { type BoardLike, forEachSelection, maybeSync, type Syncable } from './board'

/** Resolved preset style attributes. */
export interface PresetStyle {
  color: string
  borderColor: string
  borderWidth: number
  fillColor: string
}

/**
 * Convert a style preset into widget style attributes.
 *
 * @param preset - Preset definition.
 * @returns Widget style object with resolved colours.
 */
export function presetStyle(preset: StylePreset): PresetStyle {
  return {
    color: resolveColor(preset.fontColor, '#000000'),
    borderColor: resolveColor(preset.borderColor, '#000000'),
    borderWidth: preset.borderWidth,
    fillColor: resolveColor(preset.fillColor, '#ffffff'),
  }
}

/**
 * Apply a style preset to all selected widgets.
 */
export async function applyStylePreset(preset: StylePreset, board?: BoardLike): Promise<void> {
  await forEachSelection(async (item: Record<string, unknown>) => {
    const style = { ...(item.style ?? {}) } as Record<string, unknown>
    const resolved = presetStyle(preset)
    style.color = resolved.color
    style.borderColor = resolved.borderColor
    style.borderWidth = resolved.borderWidth
    style.fillColor = resolved.fillColor
    item.style = style
    await maybeSync(item as Syncable)
  }, board)
}
