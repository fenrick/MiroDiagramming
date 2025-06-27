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
    const { unmount } = render(
      <Modal
        title='X'
        isOpen
        onClose={spy}>
        <button>Hi</button>
      </Modal>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(spy).toHaveBeenCalled();
    unmount();
  });

  test('focus wraps with Tab and Shift+Tab', () => {
    const spy = vi.fn();
    render(
      <Modal
        title='Wrap'
        isOpen
        onClose={spy}>
        <button>First</button>
        <button>Second</button>
      </Modal>,
    );
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons[0];
    const second = buttons[2];
    second.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(closeBtn).toHaveFocus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(second).toHaveFocus();
  });
});
