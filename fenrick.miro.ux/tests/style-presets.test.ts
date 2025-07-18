/** @vitest-environment jsdom */
import { describe, expect, test } from 'vitest';
import '@testing-library/jest-dom';
import templatesJson from '../../templates/shapeTemplates.json';
import { STYLE_PRESET_NAMES, stylePresets } from '../src/ui/style-presets';
import type { TemplateDefinition } from '../src/board/templates';
import { templateManager } from '../src/board/templates';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StyleTab } from '../src/ui/pages/StyleTab';

// Ensure presets derive from templates
describe('style-presets', () => {
  test('presets derived from templates', () => {
    const tpl = (templatesJson as Record<string, TemplateDefinition>)
      .Technology;
    const style = templateManager.resolveStyle(tpl.elements[0].style);
    expect(stylePresets.Technology.fillColor).toBe(style.fillColor);
    expect(stylePresets.Technology.borderColor).toBe(style.borderColor);
    expect(stylePresets.Technology.borderWidth).toBe(style.borderWidth);
    expect(STYLE_PRESET_NAMES).toContain('Technology');
  });

  test('StyleTab renders preset buttons', async () => {
    render(React.createElement(StyleTab));
    for (const name of STYLE_PRESET_NAMES) {
      expect(
        screen.getByRole('button', { name: new RegExp(name, 'i') }),
      ).toBeInTheDocument();
    }
  });
});
