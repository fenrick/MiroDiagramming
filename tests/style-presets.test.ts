import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import templatesJson from '../templates/shapeTemplates.json';
import { stylePresets, STYLE_PRESET_NAMES } from '../src/ui/style-presets';
import { templateManager } from '../src/board/templates';
import type { TemplateDefinition } from '../src/board/templates';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StyleTab } from '../src/ui/pages/StyleTab';

// Ensure presets derive from templates
describe('style-presets', () => {
  test('presets derived from templates', () => {
    const tpl = (templatesJson as Record<string, TemplateDefinition>)
      .BusinessService;
    const fill = templateManager.resolveStyle(tpl.elements[0].style)
      .fillColor as string;
    expect(stylePresets.BusinessService.fillColor).toBe(fill);
    expect(STYLE_PRESET_NAMES).toContain('BusinessService');
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
