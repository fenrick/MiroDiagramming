import React from 'react';

export interface ModalProps {
  /** Dialog title displayed in the header. */
  title: string;
  /** Whether the modal is visible. */
  isOpen: boolean;
  /** Callback when the dialog should close. */
  onClose: () => void;
  /** Optional size variant. */
  size?: 'small' | 'medium';
  /** Modal content. */
  children: React.ReactNode;
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
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const root = ref.current;
    if (!root) return;
    const focusable = root.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab' && ref.current) {
        const nodes = Array.from(
          ref.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement as HTMLElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      className='modal-backdrop'
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onMouseDown={onClose}>
      <div
        role='dialog'
        aria-modal='true'
        aria-label={title}
        className={`modal modal-${size}`}
        ref={ref}
        onMouseDown={(e) => e.stopPropagation()}>
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
      </div>
    </div>
  );
}
