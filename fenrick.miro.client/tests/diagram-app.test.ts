import { DiagramApp } from "../src/app/diagram-app";

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

/**
 * Tests for the DiagramApp singleton and initialization logic.
 */
describe("DiagramApp",
  () => {
    afterEach(() => {
      jest.restoreAllMocks();
      delete global.miro;
    });

    test("getInstance returns the same object",
      () => {
        const app1 = DiagramApp.getInstance();
        const app2 = DiagramApp.getInstance();
        expect(app1).toBe(app2);
      });

    test("init registers handlers and opens panel for commands",
      async () => {
        const openPanel = jest.fn().mockResolvedValue(undefined);
        const on = jest.fn((e: string, cb: () => Promise<void>) => {
          if (e === "icon:click" || e === "custom:edit-metadata") {
            cb();
          }
        });
        global.miro = { board: { ui: { on, openPanel } } };
        await DiagramApp.getInstance().init();
        expect(on).toHaveBeenCalledWith("icon:click", expect.any(Function));
        expect(on).toHaveBeenCalledWith(
          "custom:edit-metadata",
          expect.any(Function),
        );
        expect(openPanel).toHaveBeenCalledWith({ url: "app.html" });
        expect(openPanel).toHaveBeenCalledWith({
          url: "app.html?command=edit-metadata",
        });
      });

    test("init throws when miro is undefined",
      async () =>
      await expect(DiagramApp.getInstance().init()).rejects.toThrow(
        "Miro SDK not available",
      ));
  });
