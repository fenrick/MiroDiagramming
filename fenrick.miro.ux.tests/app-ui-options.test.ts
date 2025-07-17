/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from 'fenrick.miro.ux/app/App';
import { GraphProcessor } from 'fenrick.miro.ux/core/graph/graph-processor';

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
    fireEvent.click(screen.getByTestId('start-button'));
    await act(async () => {
      selectFile();
    });
    fireEvent.keyDown(window, { key: '/', metaKey: true });
    fireEvent.click(screen.getByRole('tab', { name: 'Diagrams' }));
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Algorithm'), {
        target: { value: 'force' },
      });
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Direction'), {
        target: { value: 'LEFT' },
      });
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Spacing'), {
        target: { value: '50' },
      });
    });
    const button = screen.getByRole('button', { name: /create diagram/i });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(procSpy).toHaveBeenCalled();
  });

  test('hides layout options in cards mode', () => {
    render(React.createElement(App));
    fireEvent.click(screen.getByTestId('start-button'));
    fireEvent.click(screen.getByRole('tab', { name: 'Cards' }));
    expect(screen.queryByLabelText('Algorithm')).toBeNull();
    expect(screen.queryByLabelText('Direction')).toBeNull();
    expect(screen.queryByLabelText('Spacing')).toBeNull();
  });
});
