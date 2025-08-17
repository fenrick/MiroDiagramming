import * as React from 'react';

import { useAuthStatus } from '../core/hooks/useAuthStatus';

/**
 * Display an authorisation banner with a sign-in button when the user
 * session is missing or expired.
 *
 * The banner becomes hidden automatically once the backend reports a
 * valid session.
 */
export const AuthBanner: React.FC = () => {
  const { status, signIn } = useAuthStatus();
  if (status === 'ok') {
    return null;
  }
  const message =
    status === 'unauthorized' ? 'Sign in to Miro' : 'Session expired';
  return (
    <div role='alert'>
      <span>{message}</span>
      <button onClick={signIn}>Sign in to Miro</button>
    </div>
  );
};

export default AuthBanner;
