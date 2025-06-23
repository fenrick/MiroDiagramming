/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../src/app/app';

beforeEach(() => {
  (globalThis as { miro?: { board?: unknown } }).miro = {
    board: {
      getSelection: jest.fn().mockResolvedValue([]),
      ui: { on: jest.fn() },
    },
  };
});

afterEach(() => {
  delete (globalThis as { miro?: unknown }).miro;
});

test('Ctrl+Alt+3 selects Style tab', async () => {
  render(<App />);
  await act(async () => {
    fireEvent.keyDown(window, { key: '3', ctrlKey: true, altKey: true });
  });
  expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
});
