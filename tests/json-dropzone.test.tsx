/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { JsonDropZone } from '../src/ui/components/JsonDropZone';

test('invokes callback when file selected', async () => {
  const handle = vi.fn();
  render(<JsonDropZone onFiles={handle} />);
  const input = screen.getByTestId('file-input');
  const file = new File(['{}'], 'test.json', { type: 'application/json' });
  await act(async () => {
    fireEvent.change(input, { target: { files: [file] } });
  });
  expect(handle).toHaveBeenCalled();
  expect(handle.mock.calls[0][0]).toEqual([file]);
});
