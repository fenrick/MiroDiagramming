import * as log from '../logger';

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
    log.info('Initialising Miro UI handlers');
    if (
      typeof window === 'undefined' ||
      typeof (window as Window & { miro?: unknown }).miro === 'undefined'
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        'Miro SDK not loaded; are you opening index.html outside Miro?',
      );
      return;
    }
    if (!miro?.board?.ui) {
      log.error('Miro board UI not available');
      throw new Error('Miro SDK not available');
    }
    miro.board.ui.on('icon:click', async () => {
      log.trace('Icon clicked');
      await miro.board.ui.openPanel({ url: 'app.html' });
    });
    log.debug('Registered icon:click handler');
    miro.board.ui.on('custom:edit-metadata', async () => {
      log.trace('Edit metadata command received');
      await miro.board.ui.openPanel({ url: 'app.html?command=edit-metadata' });
    });
    log.debug('Registered edit-metadata handler');
  }
}
