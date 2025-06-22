/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataGrid, PreviewRow } from '../src/ui/components/DataGrid';

const rows: PreviewRow[] = [
  { node: 'n1', edge: 'n2', status: 'OK', valid: true },
  { node: 'n2', edge: 'n3', status: 'Missing node n3', valid: false },
];

describe('DataGrid component', () => {
  test('wraps table in scrollable container', () => {
    render(<DataGrid rows={rows} />);
    const wrapper = screen.getByRole('table').parentElement as HTMLElement;
    expect(wrapper).toHaveClass('custom-preview-grid');
  });
});
