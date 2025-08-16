/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
/* eslint-disable no-var */
import React from 'react';
import { StructuredTab } from '../src/ui/pages/StructuredTab';

var createSpy: vi.Mock;
var undoSpy: vi.Mock;
var lastProc: { undoLast: vi.Mock };

vi.mock('../src/ui/hooks/use-diagram-create', () => ({
  useDiagramCreate: (
    _queue: File[],
    _opts: unknown,
    _setQueue: (f: React.SetStateAction<File[]>) => void,
    setProgress: (p: number) => void,
    setError: (e: string | null) => void,
    setLastProc: (p: unknown) => void,
  ) => {
    createSpy = vi.fn(async () => {
      setProgress(25);
      setError('boom');
      lastProc = { undoLast: vi.fn() };
      setLastProc(lastProc);
    });
    return createSpy;
  },
  useAdvancedToggle: () => {},
}));
vi.mock('../src/ui/hooks/ui-utils', async () => {
  const actual = await vi.importActual<
    typeof import('../src/ui/hooks/ui-utils')
  >('../src/ui/hooks/ui-utils');
  undoSpy = vi.fn(async (proc: { undoLast: () => void }, clear: () => void) => {
    proc.undoLast();
    clear();
  });
  return { ...actual, undoLastImport: undoSpy };
});

function makeFile(name: string): File {
  return new File(['{}'], name, { type: 'application/json' });
}

describe('StructuredTab branches', () =>
  test('shows progress, error and undo workflow', async () => {
    render(<StructuredTab />);
    const input = screen.getByTestId('file-input');
    await act(async () =>
      fireEvent.change(input, { target: { files: [makeFile('graph.json')] } }),
    );
    await act(async () => await createSpy());
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    const undo = screen.getByRole('button', { name: /undo last import/i });
    fireEvent.click(undo);
    expect(lastProc.undoLast).toHaveBeenCalled();
    expect(undoSpy).toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: /undo last import/i }),
    ).not.toBeInTheDocument();
  }));
