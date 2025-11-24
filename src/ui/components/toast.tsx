import React from 'react'
import { Toast } from '@base-ui-components/react/toast'

export interface ToastOptions {
  message: string
  thumbnailUrl?: string
  action?: { label: string; callback: () => void }
  timeoutMs?: number
}

type ToastData = Pick<ToastOptions, 'thumbnailUrl' | 'action'>

const toastManager = Toast.createToastManager()

export function pushToast(options: ToastOptions): void {
  toastManager.add({
    description: options.message,
    timeout: options.timeoutMs ?? 5000,
    data: { thumbnailUrl: options.thumbnailUrl, action: options.action },
  })
}

const ToastList: React.FC = () => {
  const { toasts } = Toast.useToastManager()

  return (
    <Toast.Portal>
      <Toast.Viewport className="toast-container" aria-label="Notifications">
        {toasts.map((toast) => {
          const action = toast.data?.action
          return (
            <Toast.Root key={toast.id} toast={toast} className="toast">
              <Toast.Content className="toast-content">
                {toast.data?.thumbnailUrl && (
                  <img className="toast-thumb" src={toast.data.thumbnailUrl} alt="" />
                )}
                <div>{toast.description ?? toast.title}</div>
                {action && (
                  <Toast.Action
                    className="button button-secondary button-small"
                    onClick={() => {
                      action.callback()
                      toastManager.close(toast.id)
                    }}
                  >
                    {action.label}
                  </Toast.Action>
                )}
                <Toast.Close
                  className="button button-ghost button-small"
                  aria-label="Dismiss notification"
                >
                  ×
                </Toast.Close>
              </Toast.Content>
            </Toast.Root>
          )
        })}
      </Toast.Viewport>
    </Toast.Portal>
  )
}

export const ToastContainer: React.FC = () => {
  return (
    <Toast.Provider toastManager={toastManager} timeout={5000} limit={3}>
      <ToastList />
    </Toast.Provider>
  )
}
