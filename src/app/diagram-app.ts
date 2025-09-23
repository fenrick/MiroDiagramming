import * as log from '../logger'

/**
 * Singleton wrapper that wires the Miro Web SDK UI events.
 */
export class DiagramApp {
  private static instance: DiagramApp

  private constructor() {}

  private async waitForBoardUi(): Promise<NonNullable<typeof miro.board.ui>> {
    return new Promise((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 200

      const check = () => {
        const ui = miro?.board?.ui
        if (ui) {
          resolve(ui)
          return
        }
        attempts += 1
        if (attempts > maxAttempts) {
          reject(new Error('Timed out waiting for Miro board UI'))
          return
        }
        globalThis.setTimeout(check, 50)
      }

      check()
    })
  }

  /** Retrieve the shared instance of the app. */
  public static getInstance(): DiagramApp {
    if (!DiagramApp.instance) {
      DiagramApp.instance = new DiagramApp()
    }
    return DiagramApp.instance
  }

  /** Register UI handlers with the Miro board. */
  public async init(): Promise<void> {
    log.info('Initialising Miro UI handlers')
    if (
      typeof window === 'undefined' ||
      typeof (window as Window & { miro?: unknown }).miro === 'undefined'
    ) {
      console.warn('Miro SDK not loaded; are you opening the panel outside Miro?')
      return
    }
    const boardUi = await this.waitForBoardUi()
    boardUi.on('icon:click', async () => {
      log.trace('Icon clicked')
      await miro.board.ui.openPanel({ url: 'app.html' })
    })
    log.debug('Registered icon:click handler')
    boardUi.on('custom:edit-metadata', async () => {
      log.trace('Edit metadata command received')
      await miro.board.ui.openPanel({ url: 'app.html?command=edit-metadata' })
    })
    log.debug('Registered edit-metadata handler')
  }
}
