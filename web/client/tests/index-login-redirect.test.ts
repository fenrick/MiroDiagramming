import { vi, test, expect } from 'vitest';

vi.mock('../src/user-auth', () => ({
  registerWithCurrentUser: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../src/core/utils/api-fetch', () => ({
  apiFetch: vi.fn().mockResolvedValue({ status: 404 } as Response),
}));
vi.mock('../src/app/diagram-app', () => ({
  DiagramApp: {
    getInstance: vi.fn(() => ({ init: vi.fn().mockResolvedValue(undefined) })),
  },
}));

test('opens login panel when not authorised', async () => {
  const openPanel = vi.fn();
  vi.stubGlobal('miro', {
    board: {
      getUserInfo: vi.fn().mockResolvedValue({ id: 7 }),
      ui: { openPanel },
    },
  });

  await import('../src/index');

  expect(openPanel).toHaveBeenCalledWith({ url: '/oauth/login?userId=7' });
});
