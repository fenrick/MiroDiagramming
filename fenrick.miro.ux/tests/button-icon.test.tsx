/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../src/ui/components/Button';

const DummyIcon = () => <svg data-icon-component />;

describe('Button icon support', () => {
  test('renders start icon by default', () => {
    render(<Button icon={<DummyIcon />}>Hello</Button>);
    const button = screen.getByRole('button');
    const icon = button.querySelector('[data-icon-component]');
    expect(icon).toBeInTheDocument();
    expect(button.firstChild).toBe(icon);
  });

  test('renders end icon', () => {
    render(
      <Button
        icon={<DummyIcon />}
        iconPosition='end'>
        Next
      </Button>,
    );
    const button = screen.getByRole('button');
    const icon = button.querySelector('[data-icon-component]');
    expect(icon).toBeInTheDocument();
    expect(button.lastChild).toBe(icon);
  });
});
