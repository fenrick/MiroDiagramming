/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DiagramTab } from '../src/ui/pages/DiagramTab';
import { DEFAULT_LAYOUT_OPTIONS } from '../src/core/layout/elk-options';
import type { GraphProcessor } from '../src/core/graph/graph-processor';
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

  test('all conditional elements render with preset state', () => {
    const orig = React.useState;
    vi.spyOn(React, 'useState')
      .mockImplementationOnce(() => [[new File([], 'a.json')], vi.fn()])
      .mockImplementationOnce(() => ['Layered', vi.fn()])
      .mockImplementationOnce(() => [true, vi.fn()])
      .mockImplementationOnce(() => [true, vi.fn()])
      .mockImplementationOnce(() => ['Title', vi.fn()])
      .mockImplementationOnce(() => [
        { ...DEFAULT_LAYOUT_OPTIONS, algorithm: 'rectpacking' },
        vi.fn(),
      ])
      .mockImplementationOnce(() => [50, vi.fn()])
      .mockImplementationOnce(() => ['err', vi.fn()])
      .mockImplementationOnce(() => [{} as GraphProcessor, vi.fn()]);
    render(<DiagramTab />);
    expect(screen.getByText('a.json')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Frame title')).toBeInTheDocument();
    expect(screen.getByLabelText('Algorithm')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('err')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /undo last import/i }),
    ).toBeInTheDocument();
    (React.useState as unknown as vi.Mock).mockRestore();
  });

  test.each([
    ['mrtree', 'Routing mode'],
    ['layered', 'Edge routing'],
    ['rectpacking', 'Optimisation goal'],
    ['box', null],
  ])('option visibility for %s', (alg, label) => {
    vi.spyOn(React, 'useState')
      .mockImplementationOnce(() => [[new File([], 'a.json')], vi.fn()])
      .mockImplementationOnce(() => ['Layered', vi.fn()])
      .mockImplementationOnce(() => [true, vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => ['', vi.fn()])
      .mockImplementationOnce(() => [
        { ...DEFAULT_LAYOUT_OPTIONS, algorithm: alg as any },
        vi.fn(),
      ])
      .mockImplementationOnce(() => [0, vi.fn()])
      .mockImplementationOnce(() => [null, vi.fn()])
      .mockImplementationOnce(() => [undefined, vi.fn()]);
    render(<DiagramTab />);
    if (label) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText('Edge routing')).toBeNull();
      expect(screen.queryByLabelText('Routing mode')).toBeNull();
      expect(screen.queryByLabelText('Optimisation goal')).toBeNull();
    }
    (React.useState as unknown as vi.Mock).mockRestore();
  });
});
