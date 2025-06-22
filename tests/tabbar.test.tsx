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

test('More popover selects hidden tab', async () => {
  render(<App />);
  fireEvent.click(screen.getByText('More'));
  fireEvent.click(screen.getByRole('tab', { name: /templates/i }));
  expect(
    screen.getByRole('heading', { name: /templates/i }),
  ).toBeInTheDocument();
});

test('Ctrl+Alt+4 selects Style tab', async () => {
  render(<App />);
  await act(async () => {
    fireEvent.keyDown(window, { key: '4', ctrlKey: true, altKey: true });
  });
  expect(
    screen.getByRole('button', { name: /apply style/i }),
  ).toBeInTheDocument();
});
