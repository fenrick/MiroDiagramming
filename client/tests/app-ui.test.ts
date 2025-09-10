/** @vitest-environment jsdom */
import { colors } from '@mirohq/design-tokens';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { App } from '../src/app/App';
import { GraphProcessor } from '../src/core/graph/graph-processor';
import { getDropzoneStyle, undoLastImport } from '../src/ui/hooks/ui-utils';
import { pushToast } from '../src/ui/components/Toast';

vi.mock('../src/ui/components/Toast', () => ({ pushToast: vi.fn() }));

describe('App UI integration', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).miro = { board: {} };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).miro;
  });

  function selectFile(): File {
    const file = new File(['{}'], 'graph.json', { type: 'application/json' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });
    return file;
  }

  test('renders and processes diagram file', async () => {
    const spy = vi
      .spyOn(GraphProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined);
    render(React.createElement(App));
    fireEvent.click(screen.getByTestId('start-button'));
    await act(async () => selectFile());
    const button = screen.getByRole('button', { name: /create diagram/i });
    await act(async () => fireEvent.click(button));
    expect(spy).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({ layout: expect.any(Object) }),
    );
  });

  test('dropzone has accessibility attributes', () => {
    render(React.createElement(App));
    fireEvent.click(screen.getByTestId('start-button'));
    const zone = screen.getByLabelText(/file drop area/i);
    expect(zone).toHaveAttribute('aria-describedby', 'dropzone-instructions');
    const input = screen.getByLabelText(/json file input/i);
    expect(input).toBeInTheDocument();
  });

  test('shows error notification', async () => {
    const error = new Error('fail');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const spy = vi
      .spyOn(GraphProcessor.prototype, 'processFile')
      .mockRejectedValue(error);
    render(React.createElement(App));
    fireEvent.click(screen.getByTestId('start-button'));
    await act(async () => selectFile());
    const button = screen.getByRole('button', { name: /create diagram/i });
    await act(async () => fireEvent.click(button));
    expect(spy).toHaveBeenCalled();
    expect(pushToast).toHaveBeenCalledWith({ message: 'Error: fail' });
  });

  test('withFrame option forwards frame title', async () => {
    const spy = vi
      .spyOn(GraphProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined);
    render(React.createElement(App));
    fireEvent.click(screen.getByTestId('start-button'));
    await act(async () => selectFile());
    fireEvent.click(screen.getByLabelText(/wrap items in frame/i));
    fireEvent.change(screen.getByPlaceholderText(/frame title/i), {
      target: { value: 'Frame A' },
    });
    const button = screen.getByRole('button', { name: /create diagram/i });
    await act(async () => fireEvent.click(button));
    expect(spy).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({
        createFrame: true,
        frameTitle: 'Frame A',
        layout: expect.any(Object),
      }),
    );
  });

  test('undoLastImport helper calls undo and clears state', async () => {
    const proc = { undoLast: vi.fn().mockResolvedValue(undefined) } as {
      undoLast: vi.Mock;
    };
    let cleared = false;
    await undoLastImport(proc, () => {
      cleared = true;
    });
    expect(proc.undoLast).toHaveBeenCalled();
    expect(cleared).toBe(true);
  });

  test('getDropzoneStyle computes colours', () => {
    const base = getDropzoneStyle('base');
    expect(base.borderColor).toBe(colors['alpha-black-400']);
    const accept = getDropzoneStyle('accept');
    expect(accept.borderColor).toBe(colors['green-700']);
    const reject = getDropzoneStyle('reject');
    expect(reject.borderColor).toBe(colors['red-700']);
  });
});
