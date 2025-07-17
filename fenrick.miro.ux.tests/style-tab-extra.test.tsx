/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StyleTab } from 'fenrick.miro.ux/ui/pages/StyleTab';
import * as styleTools from 'fenrick.miro.ux/board/style-tools';
import {
  stylePresets,
  STYLE_PRESET_NAMES,
} from 'fenrick.miro.ux/ui/style-presets';
import * as formatTools from 'fenrick.miro.ux/board/format-tools';

vi.mock('fenrick.miro.ux/board/style-tools');

describe('StyleTab extra features', () => {
  beforeEach(() => {
    (styleTools.tweakOpacity as unknown as vi.Mock).mockResolvedValue(
      undefined,
    );
    (styleTools.tweakBorderWidth as unknown as vi.Mock).mockResolvedValue(
      undefined,
    );
    (styleTools.copyFillFromSelection as unknown as vi.Mock).mockResolvedValue(
      '#123456',
    );
  });

  test('opacity and border buttons call helpers', async () => {
    render(React.createElement(StyleTab));
    fireEvent.change(screen.getByTestId('opacity-input'), {
      target: { value: '0.2' },
    });
    fireEvent.change(screen.getByTestId('border-input'), {
      target: { value: '3' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /opacity/i }));
      fireEvent.click(screen.getByRole('button', { name: /border/i }));
    });
    expect(styleTools.tweakOpacity).toHaveBeenCalledWith(0.2);
    expect(styleTools.tweakBorderWidth).toHaveBeenCalledWith(3);
  });

  test('copy fill button updates preview', async () => {
    render(React.createElement(StyleTab));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy fill/i }));
    });
    expect(screen.getByTestId('color-hex')).toHaveTextContent('#123456');
  });

  test('apply button sends adjust delta to tweakFillColor', async () => {
    (styleTools.tweakFillColor as unknown as vi.Mock).mockResolvedValue(
      undefined,
    );
    render(React.createElement(StyleTab));
    fireEvent.change(screen.getByTestId('adjust-input'), {
      target: { value: '50' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    });
    expect(styleTools.tweakFillColor).toHaveBeenCalledWith(0.5);
  });

  test('preset button applies corresponding style', async () => {
    vi.spyOn(formatTools, 'applyStylePreset').mockResolvedValue(undefined);
    render(React.createElement(StyleTab));
    const name = STYLE_PRESET_NAMES[0];
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: new RegExp(name, 'i') }),
      );
    });
    expect(formatTools.applyStylePreset).toHaveBeenCalledWith(
      stylePresets[name],
    );
  });
});
