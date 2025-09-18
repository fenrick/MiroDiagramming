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
 * Attach keyboard shortcuts to a container element so bindings are active
 * only when the panel has focus. Use with `tabIndex={0}` on the container.
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
    const el = ref.current
    if (!el) return
    const onKey = (evt: KeyboardEvent) => handler(evt)
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [handler])

  return ref
}
