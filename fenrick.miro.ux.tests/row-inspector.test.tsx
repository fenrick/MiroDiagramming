/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RowInspector } from 'fenrick.miro.ux/ui/components/RowInspector';
import { useRowData } from 'fenrick.miro.ux/ui/hooks/use-row-data';

vi.mock('fenrick.miro.ux/ui/hooks/use-row-data');

describe('RowInspector', () => {
  test('renders list of row values', () => {
    const row = { ID: '1', Name: 'A' };
    (useRowData as unknown as vi.Mock).mockReturnValue(row);
    render(
      <RowInspector
        rows={[row]}
        idColumn='ID'
      />,
    );
    expect(screen.getByTestId('row-inspector')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A')).toBeInTheDocument();
  });

  test('invokes onUpdate when editing', () => {
    const row = { ID: '1' };
    (useRowData as unknown as vi.Mock).mockReturnValue(row);
    const spy = vi.fn();
    render(
      <RowInspector
        rows={[row]}
        idColumn='ID'
        onUpdate={spy}
      />,
    );
    fireEvent.change(screen.getByDisplayValue('1'), { target: { value: '2' } });
    expect(spy).toHaveBeenCalledWith(0, { ID: '2' });
  });

  test('returns null when no row', () => {
    (useRowData as unknown as vi.Mock).mockReturnValue(null);
    const { container } = render(
      <RowInspector
        rows={[]}
        idColumn='ID'
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
