/**
 * Singleton wrapper that wires the Miro Web SDK UI events.
 */
export class DiagramApp {
  private static instance: DiagramApp;

  private constructor() {}

  /** Retrieve the shared instance of the app. */
  public static getInstance(): DiagramApp {
    if (!DiagramApp.instance) {
      DiagramApp.instance = new DiagramApp();
    }
    return DiagramApp.instance;
  }

  /** Register UI handlers with the Miro board. */
  public async init(): Promise<void> {
    if (typeof miro === 'undefined' || !miro?.board?.ui) {
      throw new Error('Miro SDK not available');
    }
    miro.board.ui.on('icon:click', async () => {
      await miro.board.ui.openPanel({ url: 'app.html' });
    });
  }
}
