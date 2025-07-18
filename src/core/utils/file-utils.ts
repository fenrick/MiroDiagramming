/**
 * Read the contents of a `File` as UTF-8 text.
 *
 * Uses `file.text()` when available and falls back to `FileReader`
 * for broader compatibility.
 */
export class FileUtils {
  private static instance: FileUtils;

  private constructor() {}

  /** Retrieve the shared instance. */
  public static getInstance(): FileUtils {
    if (!FileUtils.instance) {
      FileUtils.instance = new FileUtils();
    }
    return FileUtils.instance;
  }

  /**
   * Read the contents of a `File` as UTF-8 text. Falls back to
   * a `FileReader` when `file.text()` is unavailable.
   */
  public async readFileAsText(file: File): Promise<string> {
    if (
      'text' in file &&
      typeof (file as { text: () => Promise<string> }).text === 'function'
    ) {
      return (file as { text: () => Promise<string> }).text();
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target) {
          reject(new Error('Failed to load file'));
          return;
        }
        resolve(e.target.result as string);
      };
      reader.onerror = () => reject(new Error('Failed to load file'));
      reader.readAsText(file, 'utf-8');
    });
  }

  /** Ensure the provided object is a valid `File`. */
  public validateFile(file: unknown): void {
    if (!file || typeof (file as { name?: unknown }).name !== 'string') {
      throw new Error('Invalid file');
    }
  }
}

export const fileUtils = FileUtils.getInstance();
