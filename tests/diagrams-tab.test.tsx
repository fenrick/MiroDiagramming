/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DiagramsTab } from '../src/ui/pages/DiagramsTab';
import { GraphProcessor } from '../src/core/graph/graph-processor';

vi.mock('../src/core/graph/graph-processor');
vi.mock('../src/board/card-processor');

describe('DiagramsTab', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).miro = { board: { ui: { on: vi.fn() } } };
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).miro;
    jest.clearAllMocks();
  });

  test('processes diagram file', async () => {
    const spy = jest
      .spyOn(GraphProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined as unknown as void);
    render(<DiagramsTab />);
    const input = screen.getByTestId('file-input');
    const file = new File(['{}'], 'graph.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create diagram/i }));
    });
    expect(spy).toHaveBeenCalled();
  });
});
