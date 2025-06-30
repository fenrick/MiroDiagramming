import React from 'react';

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
    if (!isOpen) return;
    const root = ref.current;
    if (!root) return;
    const focusable = root.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, [isOpen]);

  const getFocusables = React.useCallback((): HTMLElement[] => {
    if (!ref.current) return [];
    return Array.from(
      ref.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
  }, []);

  const trapTab = React.useCallback(
    (e: KeyboardEvent): boolean => {
      if (e.key !== 'Tab') return false;
      const nodes = getFocusables();
      if (nodes.length === 0) return false;
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
    if (!isOpen) return;
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

  if (!isOpen) return null;

  // Close the modal when the backdrop is activated via mouse or keyboard
  return (
    <div
      tabIndex={0}
      role='button'
      aria-label='Close modal'
      data-testid='modal-backdrop'
      className='modal-backdrop'
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (
          e.target === e.currentTarget &&
          (e.key === 'Enter' || e.key === ' ')
        ) {
          e.preventDefault();
          onClose();
        }
      }}>
      <dialog
        open
        aria-label={title}
        className={`modal modal-${size}`}
        ref={ref}
        onClick={(e) => e.stopPropagation()}>
        <header className='modal-header'>
          <h3>{title}</h3>
          <button
            className='button button-secondary'
            aria-label='Close'
            onClick={onClose}>
            ×
          </button>
        </header>
        <div className='modal-content'>{children}</div>
      </dialog>
    </div>
  );
}
