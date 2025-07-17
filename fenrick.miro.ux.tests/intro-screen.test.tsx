/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntroScreen } from '../fenrick.miro.ux/src/ui/components/IntroScreen';

describe('IntroScreen', () => {
  test('calls onStart when button clicked', () => {
    const spy = vi.fn();
    render(<IntroScreen onStart={spy} />);
    const intro = screen.getByTestId('intro-screen');
    expect(intro.textContent).toMatch(/Welcome to Quick Tools/i);
    fireEvent.click(screen.getByTestId('start-button'));
    expect(spy).toHaveBeenCalled();
  });
});
