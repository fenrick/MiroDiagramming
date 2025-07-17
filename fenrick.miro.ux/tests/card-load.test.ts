import { cardLoader, CardLoader } from '../src/core/utils/cards';

interface ReaderEvent {
  target: { result?: string | null } | null;
}

describe('loadCards', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { FileReader?: unknown }).FileReader;
  });

  test('parses valid file', async () => {
    class FR {
      onload: ((e: ReaderEvent) => void) | null = null;
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
    const original = (CardLoader as unknown as { instance?: CardLoader })
      .instance;
    (CardLoader as unknown as { instance?: CardLoader }).instance = undefined;
    expect(CardLoader.getInstance()).toBeDefined();
    (CardLoader as unknown as { instance?: CardLoader }).instance = original;
  });

  test('throws on invalid file object', async () => {
    await expect(cardLoader.loadCards(null as unknown as File)).rejects.toThrow(
      'Invalid file',
    );
  });

  test('throws on invalid data', async () => {
    class FR {
      onload: ((e: ReaderEvent) => void) | null = null;

      readAsText() {
        if (this.onload) {
          const evt = { target: { result: '[]' } } as ReaderEvent;
          this.onload(evt);
        }
      }
    }

    (global as { FileReader?: unknown }).FileReader = FR;
    await expect(
      cardLoader.loadCards({ name: 'x.json' } as unknown as File),
    ).rejects.toThrow('Invalid card data');
  });

  test('rejects when file load fails', async () => {
    class FR {
      onload: ((e: ReaderEvent) => void) | null = null;
      onerror: (() => void) | null = null;

      readAsText() {
        if (this.onload) {
          const evt = { target: null } as ReaderEvent;
          this.onload(evt);
        }
      }
    }

    (global as { FileReader?: unknown }).FileReader = FR;
    await expect(
      cardLoader.loadCards({ name: 'bad.json' } as unknown as File),
    ).rejects.toEqual(new Error('Failed to load file'));
  });
});
