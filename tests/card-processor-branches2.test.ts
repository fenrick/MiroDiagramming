import { CardProcessor } from '../src/board/card-processor';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

/** Additional branch coverage for CardProcessor */

describe('CardProcessor branches', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('getBoardCards caches board fetches', async () => {
    const board = { get: jest.fn().mockResolvedValue([]) };
    global.miro = { board };
    const cp = new CardProcessor();
    await (
      cp as unknown as { getBoardCards: () => Promise<unknown[]> }
    ).getBoardCards();
    await (
      cp as unknown as { getBoardCards: () => Promise<unknown[]> }
    ).getBoardCards();
    expect(board.get).toHaveBeenCalledTimes(1);
  });

  test('loadCardMap ignores cards without id metadata', async () => {
    const card = {
      getMetadata: jest.fn().mockResolvedValue({}),
      id: '1',
    } as Record<string, unknown>;
    global.miro = { board: { get: jest.fn().mockResolvedValue([card]) } };
    const cp = new CardProcessor();
    const map = await (
      cp as unknown as { loadCardMap: () => Promise<Map<string, unknown>> }
    ).loadCardMap();
    expect(map.size).toBe(0);
  });

  test('ensureTagIds skips tag with no id', async () => {
    const cp = new CardProcessor();
    global.miro = { board: { createTag: jest.fn() } };
    const tagMap = new Map([['x', { title: 'x' } as Record<string, unknown>]]);
    const ids = await (
      cp as unknown as {
        ensureTagIds: (
          t: string[],
          m: Map<string, unknown>,
        ) => Promise<string[]>;
      }
    ).ensureTagIds(['x'], tagMap);
    expect(ids).toEqual([]);
  });

  test('updateCardWidget leaves taskStatus when undefined', async () => {
    const cp = new CardProcessor();
    (cp as unknown as { ensureTagIds: () => Promise<string[]> }).ensureTagIds =
      jest.fn().mockResolvedValue([]);
    const card: Record<string, unknown> = {
      taskStatus: 'old',
      setMetadata: jest.fn(),
    };
    await (
      cp as unknown as {
        updateCardWidget: (
          c: unknown,
          d: unknown,
          m: Map<string, unknown>,
        ) => Promise<void>;
      }
    ).updateCardWidget(card, { id: '1', title: 't' }, new Map());
    expect(card.taskStatus).toBe('old');
    expect(card.setMetadata).toHaveBeenCalledWith('app.miro.cards', {
      id: '1',
    });
  });
});
