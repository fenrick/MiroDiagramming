import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { expect, test, vi } from 'vitest';

import { AuthBanner } from '../src/components/AuthBanner';
import { useAuthStatus } from '../src/core/hooks/useAuthStatus';

vi.mock('../src/core/hooks/useAuthStatus');

test('renders sign in button when unauthorised', () => {
  const signIn = vi.fn();
  (useAuthStatus as unknown as vi.Mock).mockReturnValue({
    status: 'unauthorized',
    signIn,
  });

  render(<AuthBanner />);
  const button = screen.getByRole('button', { name: 'Sign in to Miro' });
  fireEvent.click(button);
  expect(signIn).toHaveBeenCalled();
});
