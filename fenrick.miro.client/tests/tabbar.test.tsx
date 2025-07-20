/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { App } from '../src/app/App';

beforeEach(() => {
  (globalThis as { miro?: { board?: unknown } }).miro = {
    board: {
      getSelection: jest.fn().mockResolvedValue([]),
      ui: { on: jest.fn() },
    },
  };
});

afterEach(() => delete (globalThis as { miro?: unknown }).miro);

test('Ctrl+Alt+3 selects Style tab', async () => {
  render(<App />);
  fireEvent.click(screen.getByTestId('start-button'));
  await act(async () =>
    fireEvent.keyDown(window, { key: '3', ctrlKey: true, altKey: true }),
  );
  expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
});
