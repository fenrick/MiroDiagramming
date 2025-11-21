import React from 'react'

import { Modal } from './modal'

export interface CommandItem {
  readonly id: string
  readonly label: string
  readonly action: () => void
}

export interface CommandPaletteProperties {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly commands: readonly CommandItem[]
}

export function CommandPalette({
  isOpen,
  onClose,
  commands,
}: CommandPaletteProperties): React.JSX.Element | null {
  const [query, setQuery] = React.useState('')
  const [index, setIndex] = React.useState(0)
  const inputReference = React.useRef<HTMLInputElement>(null)

  const filtered = React.useMemo(
    () => commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query],
  )

  React.useEffect(() => setIndex(0), [query, isOpen])

  React.useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => inputReference.current?.focus({ preventScroll: true }), 0)
    return () => clearTimeout(timer)
  }, [isOpen])

  const handleKey = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setIndex((idx) => Math.min(idx + 1, filtered.length - 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          setIndex((idx) => Math.max(idx - 1, 0))
          break
        case 'Enter':
          event.preventDefault()
          filtered.at(index)?.action()
          onClose()
          break
        // No default
      }
    },
    [filtered, index, onClose],
  )

  return (
    <Modal title="Command Palette" isOpen={isOpen} onClose={onClose} size="small">
      <label htmlFor="command-input">Command</label>
      <input
        id="command-input"
        ref={inputReference}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKey}
        style={{
          width: '100%',
          height: 'var(--input-height)',
          padding: '0 var(--space-small)',
          borderRadius: 'var(--border-radius-medium)',
          border: '1px solid var(--indigo400)',
          marginBottom: 'var(--space-100)',
        }}
      />
      <ul
        style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}
      >
        {filtered.map((cmd, index_) => (
          <li key={cmd.id} data-selected={index_ === index}>
            <button
              type="button"
              aria-current={index_ === index ? 'true' : undefined}
              onMouseEnter={() => setIndex(index_)}
              onClick={() => {
                cmd.action()
                onClose()
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: 'var(--space-100)',
                cursor: 'pointer',
                background: index_ === index ? 'var(--indigo100)' : 'transparent',
                border: 'none',
              }}
            >
              {cmd.label}
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li>
            <button type="button" disabled style={{ width: '100%', padding: 'var(--space-100)' }}>
              No commands
            </button>
          </li>
        )}
      </ul>
    </Modal>
  )
}
