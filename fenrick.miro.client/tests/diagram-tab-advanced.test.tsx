import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { StructuredTab } from '../src/ui/pages/StructuredTab';

/** Ensure advanced options panel can be toggled via details element. */

describe('StructuredTab advanced options', () =>
  test('toggle reveals algorithm field', async () => {
    render(<StructuredTab />);
    const input = screen.getByTestId('file-input');
    const file = new File(['{}'], 'graph.json', { type: 'application/json' });
    await act(async () =>
      fireEvent.change(input, { target: { files: [file] } }),
    );
    expect(screen.getByLabelText('Algorithm')).not.toBeVisible();
    const summary = screen.getByText(/advanced options/i);
    fireEvent.click(summary);
    expect(screen.getByLabelText('Algorithm')).toBeInTheDocument();
  }));
