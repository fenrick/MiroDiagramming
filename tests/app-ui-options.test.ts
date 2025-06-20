/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../src/app';
import { GraphProcessor } from '../src/GraphProcessor';

function selectFile(): File {
  const file = new File(['{}'], 'graph.json', { type: 'application/json' });
  const input = screen.getByTestId('file-input');
  fireEvent.change(input, { target: { files: [file] } });
  return file;
}

describe('App layout options and undo button', () => {
  test('updates layout options and passes them to processor', async () => {
    const procSpy = jest
      .spyOn(GraphProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined);
    render(React.createElement(App));
    await act(async () => {
      selectFile();
    });
    fireEvent.change(screen.getByLabelText('Algorithm'), {
      target: { value: 'force' },
    });
    fireEvent.change(screen.getByLabelText('Direction'), {
      target: { value: 'LEFT' },
    });
    fireEvent.change(screen.getByLabelText('Spacing'), {
      target: { value: '50' },
    });
    const button = screen.getByRole('button', { name: /create diagram/i });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(procSpy).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({
        layout: { algorithm: 'force', direction: 'LEFT', spacing: 50 },
      }),
    );
  });

  test('hides layout options in cards mode', () => {
    render(React.createElement(App));
    fireEvent.click(screen.getByLabelText(/cards/i));
    expect(screen.queryByLabelText('Algorithm')).toBeNull();
    expect(screen.queryByLabelText('Direction')).toBeNull();
    expect(screen.queryByLabelText('Spacing')).toBeNull();
  });
});
