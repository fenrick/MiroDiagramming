/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Checkbox } from '../src/ui/components/legacy/Checkbox';

test('Checkbox renders Mirotone span and toggles value', () => {
  const handler = jest.fn();
  render(<Checkbox label='Option' value={false} onChange={handler} />);
  const input = screen.getByRole('checkbox');
  // sibling span provides visible checkbox styling
  expect(input.nextSibling).toBeInstanceOf(HTMLElement);
  fireEvent.click(input);
  expect(handler).toHaveBeenCalledWith(true);
});
