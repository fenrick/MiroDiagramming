/** @jest-environment jsdom */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { App } from '../src/app';
import { GraphProcessor } from '../src/GraphProcessor';
import { CardProcessor } from '../src/CardProcessor';

declare const global: any;

describe('App UI integration', () => {
  beforeEach(() => {
    global.miro = { board: { notifications: { showError: jest.fn() } } };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  function selectFile(): File {
    const file = new File(['{}'], 'graph.json', { type: 'application/json' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });
    return file;
  }

  test('renders and processes diagram file', async () => {
    const spy = jest
      .spyOn(GraphProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined as any);
    render(React.createElement(App));
    selectFile();
    const button = screen.getByRole('button', { name: /create diagram/i });
    fireEvent.click(button);
    expect(spy).toHaveBeenCalled();
  });

  test('toggles to cards mode and processes', async () => {
    const spy = jest
      .spyOn(CardProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined as any);
    render(React.createElement(App));
    fireEvent.click(screen.getByLabelText(/cards/i));
    selectFile();
    const button = screen.getByRole('button', { name: /create cards/i });
    fireEvent.click(button);
    expect(spy).toHaveBeenCalled();
  });

  test('mode radio buttons change description text', () => {
    render(React.createElement(App));
    fireEvent.click(screen.getByLabelText(/cards/i));
    expect(
      screen.getByText(/select the json file to import a list of cards/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/diagram/i));
    expect(
      screen.getByText(/select the json file to import a diagram/i),
    ).toBeInTheDocument();
  });
});
