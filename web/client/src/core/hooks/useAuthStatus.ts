import { useCallback, useEffect, useRef, useState } from 'react';

import { apiFetch } from '../utils/api-fetch';

export type AuthState = 'ok' | 'unauthorized' | 'expired';

export interface AuthStatus {
  status: AuthState;
  /**
   * Execute a job and capture 401 responses to trigger re-authentication.
   */
  runWithAuth<T>(job: () => Promise<T>): Promise<T | undefined>;
  /**
   * Redirect the user to begin the OAuth login flow.
   */
  signIn(): void;
  /**
   * Query the backend for the current authorisation status.
   */
  check(): Promise<void>;
}

/**
 * Hook that tracks the user's authentication status and resumes pending jobs
 * once the session is repaired.
 */
export function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthState>('ok');
  const pending = useRef<(() => Promise<unknown>) | null>(null);

  const check = useCallback(async () => {
    const res = await apiFetch('/api/auth/status');
    setStatus(res.ok ? 'ok' : 'unauthorized');
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  useEffect(() => {
    if (status === 'ok' && pending.current) {
      void pending.current();
      pending.current = null;
    }
  }, [status]);

  const runWithAuth = useCallback(
    async <T,>(job: () => Promise<T>): Promise<T | undefined> => {
      try {
        const result = await job();
        // if job resolves to a Response, check status
        if (
          typeof (result as unknown as { status?: number }).status ===
            'number' &&
          (result as unknown as { status?: number }).status === 401
        ) {
          setStatus('expired');
          pending.current = job;
          return undefined;
        }
        return result;
      } catch (err) {
        if ((err as { status?: number }).status === 401) {
          setStatus('expired');
          pending.current = job;
          return undefined;
        }
        throw err;
      }
    },
    [],
  );

  const signIn = useCallback(() => {
    window.location.href = '/oauth/login';
  }, []);

  return { status, runWithAuth, signIn, check };
}
