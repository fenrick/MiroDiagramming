/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ArrangeTab } from '../src/ui/pages/ArrangeTab';
import * as gridTools from '../src/board/grid-tools';

vi.mock('../src/board/grid-tools');

describe('ArrangeTab grid branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('updates grid settings and orientation', async () => {
    const spy = vi
      .spyOn(gridTools, 'applyGridLayout')
      .mockResolvedValue(undefined as unknown as void);
    render(<ArrangeTab />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Columns'), {
        target: { value: '3' },
      });
      fireEvent.change(screen.getByLabelText('Gap'), {
        target: { value: '30' },
      });
    });
    fireEvent.click(screen.getByLabelText('Sort by name'));
    fireEvent.change(screen.getByLabelText('Order'), {
      target: { value: 'vertical' },
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/arrange grid/i));
    });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        cols: 3,
        padding: 30,
        sortByName: true,
        sortOrientation: 'vertical',
      }),
    );
  });
});
