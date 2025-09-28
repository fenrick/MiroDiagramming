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
  const ref = React.useRef<T>(null)

  React.useEffect(() => {
    if (!active || !ref.current) {
      return
    }
    const container = ref.current
    const selector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"]):not([role="toolbar"])'

    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(selector))

    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') {
        return
      }
      const focusable = getFocusable()
      if (focusable.length === 0) {
        return
      }
      e.preventDefault()
      const current = document.activeElement as HTMLElement | null
      const idx = Math.max(0, current ? focusable.indexOf(current) : 0)
      const delta = e.shiftKey ? -1 : 1
      const nextIndex = (idx + delta + focusable.length) % focusable.length
      focusable[nextIndex]!.focus()
    }

    container.addEventListener('keydown', handleKey)
    const first = getFocusable()[0]
    first?.focus()

    return () => {
      container.removeEventListener('keydown', handleKey)
    }
  }, [active, onClose])

  return ref
}
