import templatesJson from '../../templates/shapeTemplates.json'
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
 * Populated from {@link ../../templates/shapeTemplates.json}. The JSON file
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
function valueOrDefault<T>(value: T | undefined, defaultValue: T): T {
  return value ?? defaultValue
}

function templateToPreset(name: string, template: { elements?: TemplateElement[] }): StylePreset {
  const element = template.elements?.[0]
  const resolved = templateManager.resolveStyle(element?.style ?? {})
  const fill = valueOrDefault(
    resolved.fillColor as string | undefined,
    valueOrDefault(
      templateManager.resolveStyle({ fillColor: element?.fill ?? '' }).fillColor as
        | string
        | undefined,
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

const rawTemplates = templatesJson as Record<string, unknown>

export const stylePresets: Record<string, StylePreset> = Object.fromEntries(
  Object.entries(rawTemplates)
    .filter(([name]) => name !== 'stylePresets')
    .map(([name, tpl]) => [name, templateToPreset(name, tpl as { elements?: TemplateElement[] })]),
)

/** Array of preset names in insertion order. */
export const STYLE_PRESET_NAMES = Object.keys(stylePresets)
