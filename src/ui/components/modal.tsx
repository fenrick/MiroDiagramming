import React from 'react'
import { styled } from '@mirohq/design-system'

import { Button } from './Button'

export interface ModalProperties {
  /** Dialog title displayed in the header. */
  readonly title: string
  /** Whether the modal is visible. */
  readonly isOpen: boolean
  /** Callback when the dialog should close. */
  readonly onClose: () => void
  /** Optional size variant. */
  readonly size?: 'small' | 'medium'
  /** Modal content. */
  readonly children: React.ReactNode
}

/**
 * Accessible modal dialog with focus trap and Escape key handling.
 *
 * Uses the native `<dialog>` element and sets an explicit
 * `dialog` role for assistive technologies.
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
    if (!isOpen) {
      return
    }
    const root = reference.current
    if (!root) {
      return
    }
    const focusable = root.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.focus()
  }, [isOpen])

  const getFocusables = React.useCallback((): HTMLElement[] => {
    if (!reference.current) {
      return []
    }
    return [
      ...reference.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ]
  }, [])

  const trapTab = React.useCallback(
    (event: KeyboardEvent): boolean => {
      if (event.key !== 'Tab') {
        return false
      }
      const nodes = getFocusables()
      if (nodes.length === 0) {
        return false
      }
      const first = nodes[0]!
      const last = nodes.at(-1)!
      const active = document.activeElement as HTMLElement
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
    if (!isOpen) {
      return
    }
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

  if (!isOpen) {
    return null
  }

  // Close the modal when the backdrop is activated via mouse or keyboard
  return (
    <Container>
      <Backdrop
        type="button"
        aria-label="Close modal"
        data-testid="modal-backdrop"
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          if (event.target === event.currentTarget) {
            onClose()
          }
        }}
      />
      <Dialog open aria-label={title} aria-modal="true" ref={reference} size={size}>
        <Header>
          <h3>{title}</h3>
          <Button variant="secondary" aria-label="Close" onClick={onClose}>
            ×
          </Button>
        </Header>
        <Content>{children}</Content>
      </Dialog>
    </Container>
  )
}

const Container = styled('div', { position: 'fixed', inset: 0, zIndex: 1000 })

const Backdrop = styled('button', {
  position: 'absolute',
  inset: 0,
  background: 'var(--colors-background-alpha-neutrals-overlay-subtle)',
  border: 'none',
  padding: 0,
})

const Dialog = styled('dialog', {
  position: 'relative',
  margin: 'auto',
  border: 'none',
  borderRadius: 'var(--radii-100)',
  background: 'var(--colors-background-neutrals)',
  color: 'var(--primary-text-color)',
  padding: 'var(--space-medium)',
  maxWidth: 'var(--size-modal-medium)',
  variants: {
    size: {
      small: { width: 'var(--size-modal-small)' },
      medium: { width: 'var(--size-modal-medium)' },
    },
  },
})

const Header = styled('header', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--space-small)',
})

const Content = styled('div', { overflowY: 'auto' })
