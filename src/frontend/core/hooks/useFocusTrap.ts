import React from 'react';

/**
 * Trap keyboard focus within a container and close on Escape.
 *
 * @param active - Whether the trap is enabled.
 * @param onClose - Callback invoked when Escape is pressed.
 * @returns Ref to attach to the container element.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onClose: () => void,
): React.RefObject<T> {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!active || !ref.current) {
      return;
    }
    const container = ref.current;
    const selector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(selector));

    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') {
        return;
      }
      const focusable = getFocusable();
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKey);
    const first = getFocusable()[0];
    first?.focus();

    return () => {
      container.removeEventListener('keydown', handleKey);
    };
  }, [active, onClose]);

  return ref;
}
