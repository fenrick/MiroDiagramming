import React from 'react'

import { Button } from './button'

/** A single toast notification. */
export interface ToastOptions {
  message: string
  thumbnailUrl?: string
  action?: { label: string; callback: () => void }
}

interface Toast extends ToastOptions {
  id: string
}

const listeners = new Set<(t: Toast) => void>()

export function pushToast(options: ToastOptions): void {
  const toast: Toast = { id: crypto.randomUUID(), ...options }
  for (const l of listeners) l(toast)
}

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
        <div
          key={t.id}
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-100)',
            padding: 'var(--space-150)',
            borderRadius: 'var(--border-radius-medium)',
            border: '1px solid var(--indigo200)',
            background: 'var(--white)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          {t.thumbnailUrl && <img className="toast-thumb" src={t.thumbnailUrl} alt="" />}
          <div style={{ flex: 1 }}>{t.message}</div>
          {t.action && (
            <Button
              variant="tertiary"
              onClick={() => {
                t.action?.callback()
                remove(t.id)
              }}
            >
              {t.action.label}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
