/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { RegexSearchField } from '../src/ui/components/RegexSearchField';

test('input and toggle trigger callbacks', () => {
  const onChange = vi.fn();
  const onToggle = vi.fn();
  render(
    <RegexSearchField
      label='Find'
      value='foo'
      onChange={onChange}
      regex={false}
      onRegexToggle={onToggle}
    />,
  );
  fireEvent.change(screen.getByLabelText('Find'), { target: { value: 'bar' } });
  expect(onChange).toHaveBeenCalledWith('bar');
  fireEvent.click(screen.getByRole('switch', { name: /regex/i }));
  expect(onToggle).toHaveBeenCalledWith(true);
});
