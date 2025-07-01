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

  test('renders h2 heading', () => {
    render(<Heading level={2}>Section</Heading>);
    const el = screen.getByRole('heading', { level: 2 });
    expect(el.tagName).toBe('H2');
  });

  test('renders h4 heading', () => {
    render(<Heading level={4}>Footer</Heading>);
    const el = screen.getByRole('heading', { level: 4 });
    expect(el.tagName).toBe('H4');
  });
});
