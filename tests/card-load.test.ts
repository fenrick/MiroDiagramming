import { cardLoader, CardLoader } from '../src/cards';

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
        const json = {
          cards: [
            {
              title: 't',
              taskStatus: 'done',
              style: { cardTheme: '#fff', fillBackground: 'true', extra: 1 },
              fields: [{ value: 'x' }],
            },
          ],
        };
        this.onload && this.onload({ target: { result: JSON.stringify(json) } });
      }
    }
    (global as any).FileReader = FR;
    const data = await cardLoader.loadCards({ name: 'c.json' } as any);
    expect(data).toEqual([
      {
        title: 't',
        taskStatus: 'done',
        style: { cardTheme: '#fff', fillBackground: true },
        fields: [{ value: 'x' }],
      },
    ]);
  });

  test('getInstance creates singleton when missing', () => {
    const original = (CardLoader as any).instance;
    (CardLoader as any).instance = undefined;
    expect(CardLoader.getInstance()).toBeDefined();
    (CardLoader as any).instance = original;
  });

  test('throws on invalid file object', async () => {
    await expect(cardLoader.loadCards(null as any)).rejects.toThrow(
      'Invalid file',
    );
  });

  test('throws on invalid data', async () => {
    class FR {
      onload: ((e: any) => void) | null = null;
      readAsText() {
        this.onload && this.onload({ target: { result: '[]' } });
      }
    }
    (global as any).FileReader = FR;
    await expect(
      cardLoader.loadCards({ name: 'x.json' } as any),
    ).rejects.toThrow('Invalid card data');
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
    await expect(
      cardLoader.loadCards({ name: 'bad.json' } as any),
    ).rejects.toBe('Failed to load file');
  });
});
