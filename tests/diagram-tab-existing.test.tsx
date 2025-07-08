/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DiagramsTab } from '../src/ui/pages/DiagramsTab';
import { GraphProcessor } from '../src/core/graph/graph-processor';

vi.mock('../src/core/graph/graph-processor');

describe('DiagramsTab existing node option', () => {
  beforeEach(() => {
    (globalThis as unknown as { miro: unknown }).miro = {
      board: { ui: { on: vi.fn() } },
    };
  });

  afterEach(() => {
    delete (globalThis as unknown as { miro: unknown }).miro;
    vi.clearAllMocks();
  });

  test('passes existingMode option', async () => {
    const spy = vi
      .spyOn(GraphProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined as unknown as void);
    render(<DiagramsTab />);
    const file = new File(['{}'], 'graph.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(screen.getByTestId('file-input'), {
        target: { files: [file] },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create diagram/i }));
    });
    expect(spy).toHaveBeenCalledWith(
      file,
      expect.objectContaining({ existingMode: 'move' }),
    );
  });
});
