import { GraphAuth } from '../src/core/utils/graph-auth';

describe('GraphAuth', () => {
  test('set, get and clear token', () => {
    const auth = new GraphAuth();
    auth.setToken('abc');
    expect(auth.getToken()).toBe('abc');
    auth.clearToken();
    expect(auth.getToken()).toBeNull();
  });

  test('handleRedirect extracts token', () => {
    const auth = new GraphAuth();
    const origHash = window.location.hash;
    window.location.hash = '#access_token=xyz';
    auth.handleRedirect();
    expect(auth.getToken()).toBe('xyz');
    expect(window.location.hash).toBe('');
    window.location.hash = origHash;
  });
});
