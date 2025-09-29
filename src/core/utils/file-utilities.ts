import * as log from '../../logger'

/**
 * Read the contents of a `File` as UTF-8 text.
 *
 * Uses `file.text()` when available and falls back to `FileReader`
 * for broader compatibility.
 */
export class FileUtilities {
  private static instance: FileUtilities
  private static instances = 0

  private constructor() {
    // Record construction to avoid empty constructor while keeping singleton semantics
    FileUtilities.instances += 1
  }

  /** Retrieve the shared instance. */
  public static getInstance(): FileUtilities {
    if (!FileUtilities.instance) {
      FileUtilities.instance = new FileUtilities()
    }
    return FileUtilities.instance
  }

  /**
   * Read the contents of a `File` as UTF-8 text. Falls back to
   * a `FileReader` when `file.text()` is unavailable.
   */
  public async readFileAsText(file: File): Promise<string> {
    log.debug({ name: file.name }, 'Reading file')
    if ('text' in file && typeof (file as { text: () => Promise<string> }).text === 'function') {
      log.trace('Using File.text API')
      const data = await (file as { text: () => Promise<string> }).text()
      log.info('File read via text API')
      return data
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.addEventListener('load', (event) => {
        if (!event.target) {
          reject(new Error('Failed to load file'))
          return
        }
        log.info('File loaded via FileReader')
        resolve((event.target as FileReader).result as string)
      })
      reader.addEventListener('error', () => reject(new Error('Failed to load file')))
      reader.readAsText(file, 'utf8')
    })
  }

  /** Ensure the provided object is a valid `File`. */
  public validateFile(file: unknown): void {
    if (!file || typeof (file as { name?: unknown }).name !== 'string') {
      throw new Error('Invalid file')
    }
  }
}

export const fileUtilities = FileUtilities.getInstance()
