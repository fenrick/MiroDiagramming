/** @vitest-environment jsdom */
/* eslint-disable no-var */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  StructuredTab,
  handleFileDrop,
} from '../fenrick.miro.ux/src/ui/pages/StructuredTab';

vi.mock('../fenrick.miro.ux/src/core/graph/graph-processor', () => ({
  GraphProcessor: class {
    processFile = vi.fn();
  },
  ExistingNodeMode: { move: 'move' },
}));
vi.mock('../fenrick.miro.ux/src/core/graph/hierarchy-processor', () => ({
  HierarchyProcessor: class {
    processFile = vi.fn();
  },
}));

var createSpy: vi.Mock;
vi.mock('../fenrick.miro.ux/src/ui/hooks/use-diagram-create', () => ({
  useDiagramCreate: () => {
    createSpy = vi.fn();
    return createSpy;
  },
  useAdvancedToggle: () => {},
}));

// helper to create a dummy file
function makeFile(name: string): File {
  return new File(['{}'], name, { type: 'application/json' });
}

describe('handleFileDrop', () => {
  test('queues the first file and clears errors', () => {
    const setQueue = vi.fn();
    const setError = vi.fn();
    const fileA = makeFile('a.json');
    const fileB = makeFile('b.json');
    handleFileDrop([fileA, fileB], setQueue, setError);
    expect(setQueue).toHaveBeenCalledWith([fileA]);
    expect(setError).toHaveBeenCalledWith(null);
  });
});

describe('StructuredTab', () => {
  test('frame title field toggles with checkbox', async () => {
    render(<StructuredTab />);
    const input = screen.getByTestId('file-input');
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('graph.json')] } });
    });
    expect(
      screen.queryByPlaceholderText('Frame title'),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Wrap items in frame'));
    expect(screen.getByPlaceholderText('Frame title')).toBeInTheDocument();
  });

  test('advanced options reveal algorithm select', async () => {
    render(<StructuredTab />);
    const input = screen.getByTestId('file-input');
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('graph.json')] } });
    });
    const summary = screen.getByText(/advanced options/i);
    fireEvent.click(summary);
    expect(screen.getByLabelText('Algorithm')).toBeInTheDocument();
  });

  test('lists dropped files and triggers create callback', async () => {
    render(<StructuredTab />);
    const input = screen.getByTestId('file-input');
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('graph.json')] } });
    });
    expect(screen.getByText('graph.json')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create diagram/i }));
    });
    expect(createSpy).toHaveBeenCalled();
  });
});
