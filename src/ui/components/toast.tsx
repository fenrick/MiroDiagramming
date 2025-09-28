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
export function pushToast(options: ToastOptions): void {
  const toast: Toast = { id: crypto.randomUUID(), ...options }
  for (const l of listeners) l(toast)
}

/**
 * Container rendering toast notifications in the bottom-right corner.
 */
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const enqueueToast = React.useCallback((t: Toast) => {
    setToasts((previous) => [...previous, t].slice(-3))
  }, [])

  const remove = React.useCallback((id: string) => {
    setToasts((previous) => previous.filter((t) => t.id !== id))
  }, [])

  const scheduleDismiss = React.useCallback(
    (id: string) => {
      globalThis.setTimeout(() => remove(id), 5000)
    },
    [remove],
  )

  React.useEffect(() => {
    const listener = (t: Toast) => {
      enqueueToast(t)
      scheduleDismiss(t.id)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [enqueueToast, scheduleDismiss])

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
