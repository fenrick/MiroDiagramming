import templatesJson from '../../templates/shapeTemplates.json';
import type { TemplateElement } from '../board/templates';

/** Definition of a named style preset. */
export interface StylePreset {
  label: string;
  fontColor: string;
  borderWidth: number;
  borderColor: string;
  fillColor: string;
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
};

/**
 * Derive a style preset from the first element of a template.
 */
function templateToPreset(
  name: string,
  tpl: { elements?: TemplateElement[] },
): StylePreset {
  const el = tpl.elements?.[0];
  const style = (el?.style ?? {}) as Record<string, unknown>;
  return {
    label: name,
    fontColor: (style.fontColor as string) ?? DEFAULT_PRESET.fontColor,
    borderWidth: (style.borderWidth as number) ?? DEFAULT_PRESET.borderWidth,
    borderColor: (style.borderColor as string) ?? DEFAULT_PRESET.borderColor,
    fillColor:
      (style.fillColor as string) ??
      (el?.fill as string) ??
      DEFAULT_PRESET.fillColor,
  };
}

export const stylePresets: Record<string, StylePreset> = Object.fromEntries(
  Object.entries(templatesJson)
    .filter(([name]) => name !== 'stylePresets')
    .map(([name, tpl]) => [
      name,
      templateToPreset(name, tpl as { elements?: TemplateElement[] }),
    ]),
);

/** Array of preset names in insertion order. */
export const STYLE_PRESET_NAMES = Object.keys(stylePresets);
