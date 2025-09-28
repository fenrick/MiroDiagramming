import React from 'react'

export interface Keybinding {
  readonly ctrl?: boolean
  readonly alt?: boolean
  readonly shift?: boolean
  readonly meta?: boolean
  readonly key: string
  readonly onMatch: () => void
}

/**
 * Attach keyboard shortcuts.
 *
 * Binds to the referenced element when available, otherwise falls back to `document`.
 * This avoids adding `tabIndex` on non-interactive elements purely to capture focus.
 */
export function useKeybinding(bindings: Keybinding[]) {
  const handler = React.useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      for (const b of bindings) {
        if (
          key === b.key.toLowerCase() &&
          (b.ctrl ?? false) === event.ctrlKey &&
          (b.alt ?? false) === event.altKey &&
          (b.shift ?? false) === event.shiftKey &&
          (b.meta ?? false) === event.metaKey
        ) {
          event.preventDefault()
          b.onMatch()
          return
        }
      }
    },
    [bindings],
  )

  const reference = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const target: HTMLElement | Document | null = reference.current ?? document
    if (!target) {
      return
    }
    const onKey = (event: KeyboardEvent) => handler(event)
    target.addEventListener('keydown', onKey as EventListener)
    return () => target.removeEventListener('keydown', onKey as EventListener)
  }, [handler])

  return reference
}
