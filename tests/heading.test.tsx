import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Heading } from '../src/ui/components/legacy/Heading';

describe('Heading', () => {
  test('renders h1 by default', () => {
    render(<Heading>Title</Heading>);
    const el = screen.getByRole('heading', { level: 1 });
    expect(el).toHaveTextContent('Title');
  });

  test('renders correct heading level', () => {
    render(<Heading level={3}>Sub</Heading>);
    const el = screen.getByRole('heading', { level: 3 });
    expect(el.tagName).toBe('H3');
  });
});
