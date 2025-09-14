import React from 'react'
import { Callout } from '@mirohq/design-system'

import { Button } from './Button'

/** A single toast notification. */
export interface ToastOptions {
  /** Message to display. */
  message: string
  /** Optional thumbnail image URL. */
  thumbnailUrl?: string
  /** Optional action button. */
  action?: { label: string; callback: () => void }
}

interface Toast extends ToastOptions {
  id: string
}

const listeners = new Set<(t: Toast) => void>()

/** Emit a toast to all listeners. */
export function pushToast(opts: ToastOptions): void {
  const toast: Toast = { id: crypto.randomUUID(), ...opts }
  listeners.forEach((l) => l(toast))
}

/**
 * Container rendering toast notifications in the bottom-right corner.
 */
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  React.useEffect(() => {
    const listener = (t: Toast) => {
      setToasts((prev) => {
        const next = [...prev, t]
        return next.slice(-3)
      })
      setTimeout(() => {
        setToasts((prev) => prev.filter((to) => to.id !== t.id))
      }, 5000)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Callout key={t.id} role="alert" variant="neutral" dismissible={false}>
          <Callout.Content>
            {t.thumbnailUrl && <img className="toast-thumb" src={t.thumbnailUrl} alt="" />}
            <Callout.Description>{t.message}</Callout.Description>
          </Callout.Content>
          {t.action && (
            <Callout.Actions>
              <Button
                variant="tertiary"
                onClick={() => {
                  t.action?.callback()
                  remove(t.id)
                }}
              >
                {t.action.label}
              </Button>
            </Callout.Actions>
          )}
        </Callout>
      ))}
    </div>
  )
}
