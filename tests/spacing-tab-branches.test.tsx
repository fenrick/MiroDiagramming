/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SpacingTab } from '../src/ui/pages/SpacingTab';
import * as spacingTools from '../src/board/spacing-tools';

vi.mock('../src/board/spacing-tools');

describe('SpacingTab branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('updates options and applies layout', async () => {
    const spy = vi
      .spyOn(spacingTools, 'applySpacingLayout')
      .mockResolvedValue(undefined as unknown as void);
    render(<SpacingTab />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Axis'), {
        target: { value: 'y' },
      });
      fireEvent.change(screen.getByLabelText('Spacing'), {
        target: { value: '30' },
      });
      fireEvent.change(screen.getByLabelText('Mode'), {
        target: { value: 'grow' },
      });
      fireEvent.click(screen.getByText(/distribute/i));
    });
    expect(spy).toHaveBeenCalledWith({ axis: 'y', spacing: 30, mode: 'grow' });
  });

  test('ignores invalid axis and mode inputs', async () => {
    const spy = vi
      .spyOn(spacingTools, 'applySpacingLayout')
      .mockResolvedValue(undefined as unknown as void);
    render(<SpacingTab />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Axis'), {
        target: { value: 'y' },
      });
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Axis'), {
        target: { value: 'z' },
      });
      fireEvent.change(screen.getByLabelText('Mode'), {
        target: { value: 'invalid' },
      });
      fireEvent.click(screen.getByText(/distribute/i));
    });
    expect(spy).toHaveBeenCalledWith({ axis: 'y', spacing: 20, mode: 'move' });
    const axisSelect = screen.getByLabelText('Axis') as HTMLSelectElement;
    const modeSelect = screen.getByLabelText('Mode') as HTMLSelectElement;
    expect(axisSelect.value).toBe('y');
    expect(modeSelect.value).toBe('move');
  });

  test('handles non-numeric spacing', async () => {
    const spy = vi
      .spyOn(spacingTools, 'applySpacingLayout')
      .mockResolvedValue(undefined as unknown as void);
    render(<SpacingTab />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Spacing'), {
        target: { value: 'abc' },
      });
      fireEvent.click(screen.getByText(/distribute/i));
    });
    expect(spy).toHaveBeenCalledWith({ axis: 'x', spacing: 0, mode: 'move' });
  });

  test('falls back to default mode when unset', () => {
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [
      { axis: 'x', spacing: 20 } as spacingTools.SpacingOptions,
      vi.fn(),
    ]);
    render(<SpacingTab />);
    const modeSelect = screen.getByLabelText('Mode') as HTMLSelectElement;
    expect(modeSelect.value).toBe('move');
  });
});
