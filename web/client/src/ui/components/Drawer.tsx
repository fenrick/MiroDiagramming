import React from 'react';
import { Button } from './Button';

export interface DrawerProps {
  /** Drawer title displayed in the header. */
  readonly title: string;
  /** Whether the drawer is visible. */
  readonly isOpen: boolean;
  /** Callback when the drawer should close. */
  readonly onClose: () => void;
  /** Drawer content. */
  readonly children: React.ReactNode;
}

const FOCUS_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusables(root: HTMLElement | null): HTMLElement[] {
  if (!root) {
    return [];
  }
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUS_SELECTOR));
}

export function Drawer({
  title,
  isOpen,
  onClose,
  children,
}: DrawerProps): React.JSX.Element | null {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const focusable = ref.current?.querySelector<HTMLElement>(FOCUS_SELECTOR);
    focusable?.focus();
  }, [isOpen]);

  const trapTab = React.useCallback((e: KeyboardEvent): boolean => {
    if (e.key !== 'Tab') {
      return false;
    }
    const nodes = getFocusables(ref.current);
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
  }, []);

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

  return (
    <div className='custom-drawer-container'>
      <button
        type='button'
        aria-label='Close drawer'
        data-testid='drawer-backdrop'
        className='custom-drawer-backdrop'
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
      <div
        role='dialog'
        aria-modal='true'
        aria-label={title}
        className='custom-drawer'
        ref={ref}>
        <header className='custom-drawer-header'>
          <h3>{title}</h3>
          <Button
            variant='secondary'
            aria-label='Close'
            onClick={onClose}>
            ×
          </Button>
        </header>
        <div className='custom-drawer-content'>{children}</div>
      </div>
    </div>
  );
}
