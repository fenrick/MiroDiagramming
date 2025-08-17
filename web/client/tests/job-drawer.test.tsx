/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { JobDrawer } from '../src/ui/components/JobDrawer';

describe('JobDrawer', () => {
  test('announces status changes', () => {
    render(
      <JobDrawer
        title='Jobs'
        isOpen
        onClose={() => {}}
        statusMessage='Syncing 5 changes…'
      />,
    );
    const region = screen.getByTestId('job-status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveTextContent('Syncing 5 changes…');
  });
});
