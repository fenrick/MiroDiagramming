import { loadCards } from '../src/cards';

describe('loadCards', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).FileReader;
  });

  test('parses valid file', async () => {
    class FR {
      onload: ((e: any) => void) | null = null;
      onerror: (() => void) | null = null;
      readAsText() {
        this.onload &&
          this.onload({ target: { result: '{"cards":[{"title":"t"}]}' } });
      }
    }
    (global as any).FileReader = FR;
    const data = await loadCards({ name: 'c.json' } as any);
    expect(data).toEqual([{ title: 't' }]);
  });

  test('throws on invalid file object', async () => {
    await expect(loadCards(null as any)).rejects.toThrow('Invalid file');
  });

  test('throws on invalid data', async () => {
    class FR {
      onload: ((e: any) => void) | null = null;
      readAsText() {
        this.onload && this.onload({ target: { result: '[]' } });
      }
    }
    (global as any).FileReader = FR;
    await expect(loadCards({ name: 'x.json' } as any)).rejects.toThrow(
      'Invalid card data'
    );
  });

  test('rejects when file load fails', async () => {
    class FR {
      onload: ((e: any) => void) | null = null;
      onerror: (() => void) | null = null;
      readAsText() {
        this.onload && this.onload({});
      }
    }
    (global as any).FileReader = FR;
    await expect(loadCards({ name: 'bad.json' } as any)).rejects.toBe(
      'Failed to load file'
    );
  });
});
