import { FileUtils } from '../src/file-utils';

describe('FileUtils singleton', () => {
  test('getInstance returns same instance', () => {
    const original = (FileUtils as any).instance;
    (FileUtils as any).instance = undefined;
    const first = FileUtils.getInstance();
    const second = FileUtils.getInstance();
    expect(second).toBe(first);
    (FileUtils as any).instance = original;
  });
});
