import { cardLoader, CardLoader } from '../src/core/cards';

interface ReaderEvent {
  target: { result?: string | null } | null;
}

describe('CardLoader normalization', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { FileReader?: unknown }).FileReader;
  });

  test('converts string booleans and filters arrays', async () => {
    class FR {
      onload: ((e: ReaderEvent) => void) | null = null;

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
        if (this.onload) {
          const evt = {
            target: { result: JSON.stringify(json) },
          } as ReaderEvent;
          this.onload(evt);
        }
      }
    }

    (global as { FileReader?: unknown }).FileReader = FR;
    const data = await cardLoader.loadCards({
      name: 'c.json',
    } as unknown as File);
    expect(data[0]).toEqual({
      title: 'A',
      style: { cardTheme: 'blue', fillBackground: false },
    });
    expect(data[1]).toEqual({ title: 'B', tags: ['x'] });
  });

  test('getInstance returns same loader', () => {
    const original = (CardLoader as unknown as { instance?: CardLoader })
      .instance;
    (CardLoader as unknown as { instance?: CardLoader }).instance = undefined;
    const first = CardLoader.getInstance();
    const second = CardLoader.getInstance();
    expect(second).toBe(first);
    (CardLoader as unknown as { instance?: CardLoader }).instance = original;
  });
});
