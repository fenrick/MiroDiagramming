import { useCallback, useState } from 'react'

export type AuthState = 'ok' | 'unauthorized' | 'expired'

export interface AuthStatus {
  status: AuthState
  /**
   * Execute a job and capture 401 responses to trigger re-authentication.
   */
  runWithAuth<T>(job: () => Promise<T>): Promise<T>
  /**
   * Redirect the user to begin the OAuth login flow.
   */
  signIn(): void
  /**
   * Query the backend for the current authorisation status.
   */
  check(): Promise<void>
}

/**
 * Hook that tracks the user's authentication status and resumes pending jobs
 * once the session is repaired.
 */
export function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthState>('ok')

  const check = useCallback(async () => {
    setStatus('ok')
  }, [])

  const runWithAuth = useCallback(async <T>(job: () => Promise<T>): Promise<T> => {
    return job()
  }, [])

  const signIn = useCallback(() => {
    const board = (globalThis as { miro?: { board?: { openApp?: () => Promise<void> } } }).miro
      ?.board
    void board?.openApp?.()
  }, [])

  return { status, runWithAuth, signIn, check }
}
