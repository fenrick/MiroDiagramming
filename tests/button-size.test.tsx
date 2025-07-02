/** @vitest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../src/ui/components/Button';

it('defaults to medium size for primary', () => {
  const { getByRole } = render(<Button variant='primary'>Ok</Button>);
  expect(getByRole('button')).toHaveClass('button-medium');
});

it('defaults to small size for secondary', () => {
  const { getByRole } = render(<Button variant='secondary'>Ok</Button>);
  expect(getByRole('button')).toHaveClass('button-small');
});

it('accepts explicit size override', () => {
  const { getByRole } = render(
    <Button
      variant='secondary'
      size='medium'>
      Ok
    </Button>,
  );
  expect(getByRole('button')).toHaveClass('button-medium');
});
