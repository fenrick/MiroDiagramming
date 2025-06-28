import { fileUtils } from '../src/core/utils/file-utils';

describe('FileUtils error handling', () => {
  afterEach(() => {
    // restore mocked FileReader after each test
    delete (global as { FileReader?: unknown }).FileReader;
  });

  test('readFileAsText rejects on FileReader error', async () => {
    class FR {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsText() {
        if (this.onerror) this.onerror();
      }
    }
    (global as { FileReader?: unknown }).FileReader = FR;
    await expect(
      fileUtils.readFileAsText({ name: 'file.txt' } as unknown as File),
    ).rejects.toEqual(new Error('Failed to load file'));
  });
});
