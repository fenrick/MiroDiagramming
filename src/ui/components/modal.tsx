import React from 'react'

import { Button } from './button'

export interface ModalProperties {
  title: string
  isOpen: boolean
  onClose: () => void
  size?: 'small' | 'medium'
  children: React.ReactNode
}

/**
 * Accessible modal dialog with focus trap and Escape handling.
 * Implemented with native dialog/backdrop; styled with CSS variables.
 */
export function Modal({
  title,
  isOpen,
  onClose,
  size = 'medium',
  children,
}: ModalProperties): React.JSX.Element | null {
  const reference = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    if (!isOpen) return
    const root = reference.current
    const focusable = root?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.focus()
  }, [isOpen])

  const getFocusables = React.useCallback((): HTMLElement[] => {
    if (!reference.current) return []
    return [
      ...reference.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ]
  }, [])

  const trapTab = React.useCallback(
    (event: KeyboardEvent): boolean => {
      if (event.key !== 'Tab') return false
      const nodes = getFocusables()
      if (nodes.length === 0) return false
      const first = nodes[0]
      const last = nodes.at(-1)
      const active = document.activeElement as HTMLElement | null
      if (!first || !last || !active) return false
      if (event.shiftKey && active === first) {
        last.focus()
        return true
      }
      if (!event.shiftKey && active === last) {
        first.focus()
        return true
      }
      return false
    },
    [getFocusables],
  )

  React.useEffect(() => {
    if (!isOpen) return
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (trapTab(event)) {
        event.preventDefault()
      }
    }
    globalThis.addEventListener('keydown', handleKey)
    return () => globalThis.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, trapTab])

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      <button
        type="button"
        aria-label="Close modal"
        data-testid="modal-backdrop"
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          if (event.target === event.currentTarget) onClose()
        }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--colors-background-alpha-neutrals-overlay-subtle)',
          border: 'none',
          padding: 0,
        }}
      />
      <dialog
        open
        aria-label={title}
        aria-modal="true"
        ref={reference}
        style={{
          position: 'relative',
          margin: 'auto',
          border: 'none',
          borderRadius: 'var(--border-radius-large)',
          background: 'var(--white)',
          color: 'var(--primary-text-color)',
          padding: 'var(--space-medium)',
          maxWidth: size === 'small' ? '480px' : '640px',
          width: '100%',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-small)',
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <Button variant="secondary" aria-label="Close" onClick={onClose}>
            ×
          </Button>
        </header>
        <div style={{ overflowY: 'auto' }}>{children}</div>
      </dialog>
    </div>
  )
}
