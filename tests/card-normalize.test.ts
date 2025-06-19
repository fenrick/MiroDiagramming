import { cardLoader, CardLoader } from '../src/cards';

describe('CardLoader normalization', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).FileReader;
  });

  test('converts string booleans and filters arrays', async () => {
    class FR {
      onload: ((e: any) => void) | null = null;

      readAsText() {
        const json = {
          cards: [
            {
              title: 'A',
              tags: 'bad',
              fields: 'no',
              style: { fillBackground: 'false', cardTheme: 'blue' },
            },
            {
              title: 'B',
              tags: ['x'],
              style: {},
            },
          ],
        };
        this.onload &&
          this.onload({ target: { result: JSON.stringify(json) } });
      }
    }

    (global as any).FileReader = FR;
    const data = await cardLoader.loadCards({ name: 'c.json' } as any);
    expect(data[0]).toEqual({
      title: 'A',
      style: { cardTheme: 'blue', fillBackground: false },
    });
    expect(data[1]).toEqual({ title: 'B', tags: ['x'] });
  });

  test('getInstance returns same loader', () => {
    const original = (CardLoader as any).instance;
    (CardLoader as any).instance = undefined;
    const first = CardLoader.getInstance();
    const second = CardLoader.getInstance();
    expect(second).toBe(first);
    (CardLoader as any).instance = original;
  });
});
