/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StyleTab } from '../src/ui/pages/StyleTab';
import * as styleTools from '../src/board/style-tools';

vi.mock('../src/board/style-tools');

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
});
