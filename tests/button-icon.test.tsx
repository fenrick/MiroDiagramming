/** @vitest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../src/ui/components/Button';

test('renders start icon before children', () => {
  const { getByRole } = render(<Button icon='edit'>Edit</Button>);
  const btn = getByRole('button');
  expect(btn.firstElementChild).toHaveClass('icon-edit');
});

test('renders end icon after children', () => {
  const { getByRole } = render(
    <Button
      icon='edit'
      iconPosition='end'>
      Edit
    </Button>,
  );
  const btn = getByRole('button');
  expect(btn.lastElementChild).toHaveClass('icon-edit');
});
