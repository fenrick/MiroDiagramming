/** @vitest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../src/ui/components/Button';
import { tokens } from '../src/ui/tokens';

test('defaults to space-small padding', () => {
  const { getByRole } = render(<Button>Ok</Button>);
  expect(getByRole('button')).toHaveStyle(`padding: ${tokens.space.small}`);
});

test('applies style overrides', () => {
  const { getByRole } = render(
    <Button style={{ color: 'red', borderColor: 'blue' }}>Ok</Button>,
  );
  expect(getByRole('button')).toHaveStyle('border-color: blue');
});
