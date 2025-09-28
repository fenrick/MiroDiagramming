import { styled } from '@mirohq/design-system'
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

  React.useEffect(() => {
    setIndex(0)
  }, [query, isOpen])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }
    const timer = setTimeout(() => {
      inputReference.current?.focus({ preventScroll: true })
    }, 0)
    return () => clearTimeout(timer)
  }, [isOpen])

  const handleKey = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault()
          setIndex((index_) => Math.min(index_ + 1, filtered.length - 1))

          break
        }
        case 'ArrowUp': {
          event.preventDefault()
          setIndex((index_) => Math.max(index_ - 1, 0))

          break
        }
        case 'Enter': {
          event.preventDefault()
          filtered.at(index)?.action()
          onClose()

          break
        }
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
      />
      <List>
        {filtered.map((cmd, index_) => (
          <li key={cmd.id} data-selected={index_ === index}>
            <ItemButton
              type="button"
              aria-current={index_ === index ? 'true' : undefined}
              onMouseEnter={() => setIndex(index_)}
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
