import { FileUtils } from '../src/core/utils/file-utils';

describe('FileUtils singleton', () =>
  test('getInstance returns same instance', () => {
    const original = (
      FileUtils as unknown as { instance: FileUtils | undefined }
    ).instance;
    (FileUtils as unknown as { instance: FileUtils | undefined }).instance =
      undefined;
    const first = FileUtils.getInstance();
    const second = FileUtils.getInstance();
    expect(second).toBe(first);
    (FileUtils as unknown as { instance: FileUtils | undefined }).instance =
      original;
  }));
