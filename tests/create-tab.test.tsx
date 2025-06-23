/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateTab } from '../src/ui/pages/CreateTab';
import { GraphProcessor } from '../src/core/graph/GraphProcessor';
import { CardProcessor } from '../src/board/CardProcessor';

jest.mock('../src/core/graph/GraphProcessor');
jest.mock('../src/board/CardProcessor');

describe('CreateTab', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).miro = { board: { ui: { on: jest.fn() } } };
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
    render(<CreateTab />);
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

  test('processes cards file', async () => {
    const spy = jest
      .spyOn(CardProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined as unknown as void);
    render(<CreateTab />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'cards' },
    });
    const input = screen.getByTestId('file-input');
    const file = new File(['{}'], 'cards.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create cards/i }));
    });
    expect(spy).toHaveBeenCalled();
  });
});
