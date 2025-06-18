import { fileUtils } from '../src/file-utils';

describe('file utils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).FileReader;
  });

  test('readFileAsText uses text method when available', async () => {
    const file = {
      name: 'file.txt',
      text: jest.fn().mockResolvedValue('abc'),
    } as any;
    const result = await fileUtils.readFileAsText(file);
    expect(result).toBe('abc');
    expect(file.text).toHaveBeenCalled();
  });

  test('readFileAsText falls back to FileReader', async () => {
    class FR {
      onload: ((e: any) => void) | null = null;
      onerror: (() => void) | null = null;
      readAsText() {
        this.onload && this.onload({ target: { result: 'def' } });
      }
    }
    (global as any).FileReader = FR;
    const result = await fileUtils.readFileAsText({ name: 'f.txt' } as any);
    expect(result).toBe('def');
  });

  test('validateFile throws on invalid object', () => {
    expect(() => fileUtils.validateFile(null as any)).toThrow('Invalid file');
  });
});
