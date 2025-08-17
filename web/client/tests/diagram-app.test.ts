import { DiagramApp } from '../src/app/diagram-app';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

/**
 * Tests for the DiagramApp singleton and initialization logic.
 */
describe('DiagramApp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete global.miro;
  });

  test('getInstance returns the same object', () => {
    const app1 = DiagramApp.getInstance();
    const app2 = DiagramApp.getInstance();
    expect(app1).toBe(app2);
  });

  test('init registers handlers and opens panel for commands', async () => {
    const openPanel = vi.fn().mockResolvedValue(undefined);
    const on = vi.fn((e: string, cb: () => Promise<void>) => {
      if (e === 'icon:click' || e === 'custom:edit-metadata') {
        cb();
      }
    });
    global.miro = { board: { ui: { on, openPanel } } };
    await DiagramApp.getInstance().init();
    expect(on).toHaveBeenCalledWith('icon:click', expect.any(Function));
    expect(on).toHaveBeenCalledWith(
      'custom:edit-metadata',
      expect.any(Function),
    );
    expect(openPanel).toHaveBeenCalledWith({ url: 'app.html' });
    expect(openPanel).toHaveBeenCalledWith({
      url: 'app.html?command=edit-metadata',
    });
  });

  test('init warns and returns when miro is undefined', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(DiagramApp.getInstance().init()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      'Miro SDK not loaded; are you opening index.html outside Miro?',
    );
  });
});
