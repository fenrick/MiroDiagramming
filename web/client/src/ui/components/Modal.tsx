import React from 'react';
import { Button } from './Button';

export interface ModalProps {
  /** Dialog title displayed in the header. */
  readonly title: string;
  /** Whether the modal is visible. */
  readonly isOpen: boolean;
  /** Callback when the dialog should close. */
  readonly onClose: () => void;
  /** Optional size variant. */
  readonly size?: 'small' | 'medium';
  /** Modal content. */
  readonly children: React.ReactNode;
}

/**
 * Accessible modal dialog with focus trap and Escape key handling.
 *
 * Uses the native `<dialog>` element which has an implicit
 * `dialog` role, so no explicit ARIA role is set.
 */
export function Modal({
  title,
  isOpen,
  onClose,
  size = 'medium',
  children,
}: ModalProps): React.JSX.Element | null {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const root = ref.current;
    if (!root) {
      return;
    }
    const focusable = root.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, [isOpen]);

  const getFocusables = React.useCallback((): HTMLElement[] => {
    if (!ref.current) {
      return [];
    }
    return Array.from(
      ref.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
  }, []);

  const trapTab = React.useCallback(
    (e: KeyboardEvent): boolean => {
      if (e.key !== 'Tab') {
        return false;
      }
      const nodes = getFocusables();
      if (nodes.length === 0) {
        return false;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement;
      if (e.shiftKey && active === first) {
        last.focus();
        return true;
      }
      if (!e.shiftKey && active === last) {
        first.focus();
        return true;
      }
      return false;
    },
    [getFocusables],
  );

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (trapTab(e)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, trapTab]);

  if (!isOpen) {
    return null;
  }

  // Close the modal when the backdrop is activated via mouse or keyboard
  return (
    <div className='custom-modal-container'>
      <div
        role='button'
        tabIndex={0}
        aria-label='Close modal'
        data-testid='modal-backdrop'
        className='custom-modal-backdrop'
        onClick={e => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        onKeyDown={e => {
          if (
            e.target === e.currentTarget &&
            (e.key === 'Enter' || e.key === ' ')
          ) {
            e.preventDefault();
            onClose();
          }
        }}
      />
      <dialog
        open
        aria-label={title}
        aria-modal='true'
        className={`custom-modal custom-modal-${size}`}
        ref={ref}>
        <header className='custom-modal-header'>
          <h3>{title}</h3>
          <Button
            variant='secondary'
            aria-label='Close'
            onClick={onClose}>
            ×
          </Button>
        </header>
        <div className='custom-modal-content'>{children}</div>
      </dialog>
    </div>
  );
}
