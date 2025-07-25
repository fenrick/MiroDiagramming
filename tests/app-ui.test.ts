/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../src/app/App';
import { getDropzoneStyle, undoLastImport } from '../src/ui/hooks/ui-utils';
import { tokens } from '../src/ui/tokens';
import { GraphProcessor } from '../src/core/graph/graph-processor';
import { CardProcessor } from '../src/board/card-processor';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('App UI integration', () => {
  beforeEach(() => {
    global.miro = {
      board: {
        notifications: { showError: jest.fn().mockResolvedValue(undefined) },
      },
    };
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
      .mockResolvedValue(undefined);
    render(React.createElement(App));
    await act(async () => {
      selectFile();
    });
    const button = screen.getByRole('button', { name: /create diagram/i });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(spy).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({ layout: expect.any(Object) }),
    );
  });

  test('toggles to cards mode and processes', async () => {
    const spy = jest
      .spyOn(CardProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined);
    render(React.createElement(App));
    fireEvent.click(screen.getByRole('tab', { name: 'Cards' }));
    await act(async () => {
      selectFile();
    });
    const button = screen.getByRole('button', { name: /create cards/i });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(spy).toHaveBeenCalled();
  });

  test('nested tabs switch mode', () => {
    render(React.createElement(App));
    fireEvent.click(screen.getByRole('tab', { name: 'Cards' }));
    expect(
      (screen.getByRole('tab', { name: 'Cards' }) as HTMLButtonElement)
        .classList,
    ).toContain('tab-active');
  });

  test('dropzone has accessibility attributes', () => {
    render(React.createElement(App));
    const zone = screen.getByLabelText(/file drop area/i);
    expect(zone).toHaveAttribute('aria-describedby', 'dropzone-instructions');
    const input = screen.getByLabelText(/json file input/i);
    expect(input).toBeInTheDocument();
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
      .mockResolvedValue(undefined);
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
    const proc = { undoLast: jest.fn().mockResolvedValue(undefined) } as {
      undoLast: jest.Mock;
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
    expect(base.borderColor).toBe(tokens.color.indigoAlpha[40]);
    const accept = getDropzoneStyle('accept');
    expect(accept.borderColor).toBe(tokens.color.green[700]);
    const reject = getDropzoneStyle('reject');
    expect(reject.borderColor).toBe(tokens.color.red[700]);
  });
});
