export class DiagramApp {
  private static instance: DiagramApp;
  private constructor() {}

  public static getInstance(): DiagramApp {
    if (!DiagramApp.instance) {
      DiagramApp.instance = new DiagramApp();
    }
    return DiagramApp.instance;
  }

  public async init(): Promise<void> {
    if (!(globalThis as any).miro?.board?.ui) {
      throw new Error('Miro SDK not available');
    }
    miro.board.ui.on('icon:click', async () => {
      await miro.board.ui.openPanel({ url: 'app.html' });
    });
  }
}
