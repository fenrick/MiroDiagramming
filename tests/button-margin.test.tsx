/** @vitest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../src/ui/components/Button';

test('button has margin around it', () => {
  const { getByRole } = render(<Button>Ok</Button>);
  expect(getByRole('button')).toHaveStyle(
    'margin: 0 var(--space-small) var(--space-small) 0',
  );
});
