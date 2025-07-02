/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../src/ui/components/Button';
import { IconActivity } from '@mirohq/design-system-icons/react';

describe('Button icon support', () => {
  test('renders start icon by default', () => {
    render(<Button icon={<IconActivity />}>Hello</Button>);
    const button = screen.getByRole('button');
    const icon = button.querySelector('[data-icon-component]');
    expect(icon).toBeInTheDocument();
    expect(button.firstChild).toBe(icon?.parentElement);
  });

  test('renders end icon', () => {
    render(
      <Button
        icon={<IconActivity />}
        iconPosition='end'>
        Next
      </Button>,
    );
    const button = screen.getByRole('button');
    const icon = button.querySelector('[data-icon-component]');
    expect(icon).toBeInTheDocument();
    expect(button.lastChild).toBe(icon?.parentElement);
  });
});
