/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResizeTab } from '../src/ui/pages/ResizeTab';
import * as resizeTools from '../src/board/resize-tools';

// Helper to provide a mock Miro board API
function setupBoard(): void {
  (globalThis as { miro?: { board?: unknown } }).miro = {
    board: { getSelection: jest.fn().mockResolvedValue([]) },
  };
}

describe('ResizeTab extra coverage', () => {
  beforeEach(() => {
    setupBoard();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    delete (globalThis as { miro?: unknown }).miro;
  });

  test('shows warning when size exceeds viewport limit', async () => {
    const spy = jest
      .spyOn(resizeTools, 'applySizeToSelection')
      .mockResolvedValue(undefined as unknown as void);
    render(React.createElement(ResizeTab));
    fireEvent.change(screen.getByPlaceholderText(/width/i), {
      target: { value: '15000' },
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/apply size/i));
    });
    expect(spy).not.toHaveBeenCalled();
    expect(
      screen.getByText(/bigger than your board viewport/i),
    ).toBeInTheDocument();
  });

  test('keyboard shortcuts copy and apply size', async () => {
    jest
      .spyOn(resizeTools, 'copySizeFromSelection')
      .mockResolvedValue({ width: 20, height: 30 });
    const applySpy = jest
      .spyOn(resizeTools, 'applySizeToSelection')
      .mockResolvedValue(undefined as unknown as void);
    render(React.createElement(ResizeTab));
    await act(async () => {
      fireEvent.keyDown(window, { key: 'c', altKey: true });
    });
    await act(async () => {
      fireEvent.keyDown(window, { key: 'v', altKey: true });
    });
    expect(applySpy).toHaveBeenCalledWith({ width: 20, height: 30 });
  });
});
