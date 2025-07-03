/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntroScreen } from '../src/ui/components/IntroScreen';

describe('IntroScreen', () => {
  test('calls onStart when button clicked', () => {
    const spy = vi.fn();
    render(<IntroScreen onStart={spy} />);
    expect(screen.getByText(/Welcome to Quick Tools/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('start-button'));
    expect(spy).toHaveBeenCalled();
  });
});
