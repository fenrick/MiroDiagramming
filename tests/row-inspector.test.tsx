/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RowInspector } from '../src/ui/components/RowInspector';
import { useRowData } from '../src/ui/hooks/use-row-data';

vi.mock('../src/ui/hooks/use-row-data');

describe('RowInspector', () => {
  test('renders list of row values', () => {
    (useRowData as unknown as vi.Mock).mockReturnValue({ ID: '1', Name: 'A' });
    render(
      <RowInspector
        rows={[]}
        idColumn='ID'
      />,
    );
    expect(screen.getByTestId('row-inspector')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText(/A/)).toBeInTheDocument();
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
