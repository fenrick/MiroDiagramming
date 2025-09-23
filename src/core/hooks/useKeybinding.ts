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
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      for (const b of bindings) {
        if (
          key === b.key.toLowerCase() &&
          (b.ctrl ?? false) === e.ctrlKey &&
          (b.alt ?? false) === e.altKey &&
          (b.shift ?? false) === e.shiftKey &&
          (b.meta ?? false) === e.metaKey
        ) {
          e.preventDefault()
          b.onMatch()
          return
        }
      }
    },
    [bindings],
  )

  const ref = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const target: HTMLElement | Document | null = ref.current ?? document
    if (!target) return
    const onKey = (evt: KeyboardEvent) => handler(evt)
    target.addEventListener('keydown', onKey as EventListener)
    return () => target.removeEventListener('keydown', onKey as EventListener)
  }, [handler])

  return ref
}
