/** @jest-environment jsdom */
import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App, getDropzoneStyle, undoLastImport } from '../src/app';
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
    await act(async () => {
      selectFile();
    });
    const button = screen.getByRole('button', { name: /create diagram/i });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(spy).toHaveBeenCalled();
  });

  test('toggles to cards mode and processes', async () => {
    const spy = jest
      .spyOn(CardProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined as any);
    render(React.createElement(App));
    fireEvent.click(screen.getByLabelText(/cards/i));
    await act(async () => {
      selectFile();
    });
    const button = screen.getByRole('button', { name: /create cards/i });
    await act(async () => {
      fireEvent.click(button);
    });
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

  test('shows error notification', async () => {
    const error = new Error('fail');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const spy = jest
      .spyOn(GraphProcessor.prototype, 'processFile')
      .mockRejectedValue(error);
    render(React.createElement(App));
    await act(async () => {
      selectFile();
    });
    const button = screen.getByRole('button', { name: /create diagram/i });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(spy).toHaveBeenCalled();
    expect(global.miro.board.notifications.showError).toHaveBeenCalledWith(
      'Error: fail',
    );
  });

  test('withFrame option forwards frame title', async () => {
    const spy = jest
      .spyOn(GraphProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined as any);
    render(React.createElement(App));
    await act(async () => {
      selectFile();
    });
    fireEvent.click(screen.getByLabelText(/wrap items in frame/i));
    fireEvent.change(screen.getByPlaceholderText(/frame title/i), {
      target: { value: 'Frame A' },
    });
    const button = screen.getByRole('button', { name: /create diagram/i });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(spy).toHaveBeenCalledWith(expect.any(File), {
      createFrame: true,
      frameTitle: 'Frame A',
    });
  });

  test('undoLastImport helper calls undo and clears state', () => {
    const proc = { undoLast: jest.fn() } as any;
    let cleared = false;
    undoLastImport(proc, () => {
      cleared = true;
    });
    expect(proc.undoLast).toHaveBeenCalled();
    expect(cleared).toBe(true);
  });

  test('getDropzoneStyle computes colours', () => {
    const base = getDropzoneStyle(false, false);
    expect(base.borderColor).toBe('rgba(41, 128, 185, 0.5)');
    const accept = getDropzoneStyle(true, false);
    expect(accept.borderColor).toBe('rgba(41, 128, 185, 1.0)');
    const reject = getDropzoneStyle(false, true);
    expect(reject.borderColor).toBe('rgba(192, 57, 43,1.0)');
  });
});
