import { DiagramApp } from '../src/DiagramApp';

declare const global: any;

/**
 * Tests for the DiagramApp singleton and initialization logic.
 */
describe('DiagramApp', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).miro;
  });

  test('getInstance returns the same object', () => {
    const app1 = DiagramApp.getInstance();
    const app2 = DiagramApp.getInstance();
    expect(app1).toBe(app2);
  });

  test('init registers click handler and opens panel', async () => {
    const openPanel = jest.fn().mockResolvedValue(undefined);
    const on = jest.fn((_e: string, cb: () => Promise<void>) => cb());
    global.miro = { board: { ui: { on, openPanel } } };
    await DiagramApp.getInstance().init();
    expect(on).toHaveBeenCalledWith('icon:click', expect.any(Function));
    expect(openPanel).toHaveBeenCalledWith({ url: 'app.html' });
  });
});
