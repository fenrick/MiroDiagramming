/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DiagramTab } from '../src/ui/pages/DiagramTab';
import { ElkAlgorithm } from '../src/core/layout/elk-options';
vi.mock('../src/core/graph/graph-processor');

describe('DiagramTab additional branches', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).miro = {
      board: { ui: { on: vi.fn() }, notifications: { showError: vi.fn() } },
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).miro;
  });

  test('keyboard shortcut toggles advanced options', async () => {
    render(<DiagramTab />);
    const file = new File(['{}'], 'graph.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(screen.getByTestId('file-input'), {
        target: { files: [file] },
      });
    });
    expect(screen.getByLabelText('Algorithm')).not.toBeVisible();
    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    expect(screen.getByLabelText('Algorithm')).toBeVisible();
  });

  test('all conditional elements render after interaction', async () => {
    render(<DiagramTab />);
    const file = new File(['{}'], 'a.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(screen.getByTestId('file-input'), {
        target: { files: [file] },
      });
    });
    fireEvent.click(screen.getByLabelText('Wrap items in frame'));
    fireEvent.change(screen.getByPlaceholderText('Frame title'), {
      target: { value: 'Title' },
    });
    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    fireEvent.change(screen.getByLabelText('Algorithm'), {
      target: { value: 'rectpacking' },
    });

    expect(screen.getByText('a.json')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Frame title')).toBeInTheDocument();
    expect(screen.getByLabelText('Algorithm')).toBeInTheDocument();
  });

  test.each<readonly [ElkAlgorithm, string | null]>([
    ['mrtree', 'Routing mode'],
    ['layered', 'Edge routing'],
    ['rectpacking', 'Optimisation goal'],
    ['box', null],
  ])('option visibility for %s', async (alg, label) => {
    render(<DiagramTab />);
    const file = new File(['{}'], 'a.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(screen.getByTestId('file-input'), {
        target: { files: [file] },
      });
    });
    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    fireEvent.change(screen.getByLabelText('Algorithm'), {
      target: { value: alg },
    });
    if (label) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText('Edge routing')).toBeNull();
      expect(screen.queryByLabelText('Routing mode')).toBeNull();
      expect(screen.queryByLabelText('Optimisation goal')).toBeNull();
    }
  });
});
