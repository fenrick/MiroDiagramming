import React from 'react'

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
  const reference = React.useRef<T>(null)

  React.useEffect(() => {
    if (!active || !reference.current) {
      return
    }
    const container = reference.current
    const selector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"]):not([role="toolbar"])'

    const getFocusable = (): HTMLElement[] => [...container.querySelectorAll<HTMLElement>(selector)]

    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') {
        return
      }
      const focusable = getFocusable()
      if (focusable.length === 0) {
        return
      }
      event.preventDefault()
      const current = document.activeElement as HTMLElement | null
      const index = Math.max(0, current ? focusable.indexOf(current) : 0)
      const delta = event.shiftKey ? -1 : 1
      const nextIndex = (index + delta + focusable.length) % focusable.length
      focusable[nextIndex]!.focus()
    }

    container.addEventListener('keydown', handleKey)
    const first = getFocusable()[0]
    first?.focus()

    return () => {
      container.removeEventListener('keydown', handleKey)
    }
  }, [active, onClose])

  return reference
}
