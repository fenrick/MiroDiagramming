import templatesJson from '../../../templates/shapeTemplates.json'
import type { TemplateElement } from '../board/templates'
import { templateManager } from '../board/templates'

/** Definition of a named style preset. */
export interface StylePreset {
  label: string
  fontColor: string
  borderWidth: number
  borderColor: string
  fillColor: string
}

/**
 * Collection of style presets indexed by name.
 *
 * Populated from {@link ../../../templates/shapeTemplates.json}. The JSON file
 * uses design tokens which are resolved at runtime when applying presets.
 */
const DEFAULT_PRESET: StylePreset = {
  label: '',
  fontColor: 'var(--primary-text-color)',
  borderWidth: 2,
  borderColor: 'var(--colors-gray-200)',
  fillColor: 'var(--colors-gray-200)',
}

/**
 * Derive a style preset from the first element of a template.
 */
function valueOrDefault<T>(val: T | undefined, def: T): T {
  return val ?? def
}

function templateToPreset(name: string, tpl: { elements?: TemplateElement[] }): StylePreset {
  const el = tpl.elements?.[0]
  const resolved = templateManager.resolveStyle(el?.style ?? {})
  const fill = valueOrDefault(
    resolved.fillColor as string | undefined,
    valueOrDefault(
      templateManager.resolveStyle({ fillColor: el?.fill ?? '' }).fillColor as string | undefined,
      '',
    ),
  )
  return {
    label: name,
    fontColor: valueOrDefault(resolved.fontColor as string | undefined, DEFAULT_PRESET.fontColor),
    borderWidth: valueOrDefault(
      resolved.borderWidth as number | undefined,
      DEFAULT_PRESET.borderWidth,
    ),
    borderColor: valueOrDefault(
      resolved.borderColor as string | undefined,
      DEFAULT_PRESET.borderColor,
    ),
    fillColor: valueOrDefault(fill, DEFAULT_PRESET.fillColor),
  }
}

export const stylePresets: Record<string, StylePreset> = Object.fromEntries(
  Object.entries(templatesJson)
    .filter(([name]) => name !== 'stylePresets')
    .map(([name, tpl]) => [name, templateToPreset(name, tpl as { elements?: TemplateElement[] })]),
)

/** Array of preset names in insertion order. */
export const STYLE_PRESET_NAMES = Object.keys(stylePresets)
