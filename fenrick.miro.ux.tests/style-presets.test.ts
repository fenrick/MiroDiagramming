/** @vitest-environment jsdom */
import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import templatesJson from '../templates/shapeTemplates.json';
import {
  stylePresets,
  STYLE_PRESET_NAMES,
} from 'fenrick.miro.ux/ui/style-presets';
import { templateManager } from 'fenrick.miro.ux/board/templates';
import type { TemplateDefinition } from 'fenrick.miro.ux/board/templates';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StyleTab } from 'fenrick.miro.ux/ui/pages/StyleTab';

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
