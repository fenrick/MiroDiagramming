import { styled } from '@mirohq/design-system'
import React from 'react'

import { Modal } from './Modal'

export interface CommandItem {
  readonly id: string
  readonly label: string
  readonly action: () => void
}

export interface CommandPaletteProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly commands: readonly CommandItem[]
}

export function CommandPalette({
  isOpen,
  onClose,
  commands,
}: CommandPaletteProps): React.JSX.Element | null {
  const [query, setQuery] = React.useState('')
  const [index, setIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filtered = React.useMemo(
    () => commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query],
  )

  React.useEffect(() => {
    setIndex(0)
  }, [query, isOpen])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }
    const timer = setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true })
    }, 0)
    return () => clearTimeout(timer)
  }, [isOpen])

  const handleKey = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        filtered[index]?.action()
        onClose()
      }
    },
    [filtered, index, onClose],
  )

  return (
    <Modal title="Command Palette" isOpen={isOpen} onClose={onClose} size="small">
      <label htmlFor="command-input">Command</label>
      <input
        id="command-input"
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKey}
      />
      <List>
        {filtered.map((cmd, i) => (
          <li key={cmd.id} data-selected={i === index}>
            <ItemButton
              type="button"
              aria-current={i === index ? 'true' : undefined}
              onMouseEnter={() => setIndex(i)}
              onClick={() => {
                cmd.action()
                onClose()
              }}
            >
              {cmd.label}
            </ItemButton>
          </li>
        ))}
        {filtered.length === 0 && (
          <li>
            <ItemButton type="button" disabled>
              No commands
            </ItemButton>
          </li>
        )}
      </List>
    </Modal>
  )
}

const List = styled('ul', {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  maxHeight: '200px',
  overflowY: 'auto',
})

const ItemButton = styled('button', {
  width: '100%',
  textAlign: 'left',
  padding: 'var(--space-100)',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  '&[aria-current=true]': {
    background: 'var(--colors-background-tertiary)',
  },
})
