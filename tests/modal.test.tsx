/** @vitest-environment jsdom */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from '../src/ui/components/Modal';

describe('Modal', () => {
  test('renders title and children', () => {
    render(
      <Modal
        title='Test'
        isOpen
        onClose={() => {}}>
        <button>Ok</button>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Close')).toHaveFocus();
  });

  test('escape key triggers onClose', () => {
    const spy = vi.fn();
    render(
      <Modal
        title='X'
        isOpen
        onClose={spy}>
        <button>Hi</button>
      </Modal>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(spy).toHaveBeenCalled();
  });
});
