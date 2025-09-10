import React from 'react';

vi.mock('../src/app/App', () => ({ App: () => <div data-testid='app' /> }));

vi.mock('@mirohq/websdk-react-hooks', () => ({
  MiroProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='miro-provider'>{children}</div>
  ),
}));

describe('main entrypoint', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
    // ensure no Miro SDK
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).miro;
  });

  test('warns and skips provider when Miro SDK absent', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await import('../src/main');
    expect(warnSpy).toHaveBeenCalledWith(
      'Miro SDK not found; open inside a Miro board.',
    );
    expect(document.querySelector('[data-testid="miro-provider"]')).toBeNull();
    warnSpy.mockRestore();
  });

  test('uses provider when Miro SDK present', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).miro = {};
    await import('../src/main');
    expect(
      document.querySelector('[data-testid="miro-provider"]'),
    ).not.toBeNull();
  });
});
