import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { ToastContainer, pushToast } from '../src/ui/components/Toast';
import { expect, test, vi } from 'vitest';

vi.useFakeTimers();

test('caps to three concurrent toasts', async () => {
  render(<ToastContainer />);
  pushToast({ message: '1' });
  pushToast({ message: '2' });
  pushToast({ message: '3' });
  pushToast({ message: '4' });
  await screen.findByText('4');
  const alerts = screen.getAllByRole('alert');
  expect(alerts).toHaveLength(3);
  expect(screen.queryByText('1')).toBeNull();
});
