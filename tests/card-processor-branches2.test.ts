import { CardProcessor } from '../src/board/card-processor';
import type { Frame, Tag } from '@mirohq/websdk-types';
import type { CardData } from '../src/core/utils/cards';

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

  test('getBoardTags caches board fetches', async () => {
    const board = { get: jest.fn().mockResolvedValue([]) };
    global.miro = { board };
    const cp = new CardProcessor();
    await (
      cp as unknown as { getBoardTags: () => Promise<unknown[]> }
    ).getBoardTags();
    await (
      cp as unknown as { getBoardTags: () => Promise<unknown[]> }
    ).getBoardTags();
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

  test('createFrame skips when disabled', async () => {
    const cp = new CardProcessor();
    global.miro = { board: { createFrame: jest.fn() } };
    const frame = await (
      cp as unknown as {
        createFrame: (
          o: Record<string, unknown>,
          l: {
            totalWidth: number;
            totalHeight: number;
            spot: { x: number; y: number };
          },
        ) => Promise<unknown>;
      }
    ).createFrame(
      { createFrame: false },
      { totalWidth: 1, totalHeight: 1, spot: { x: 0, y: 0 } },
    );
    expect(frame).toBeUndefined();
    expect(global.miro.board.createFrame).not.toHaveBeenCalled();
  });

  test('createCardWidgets adds cards to frame', async () => {
    const cp = new CardProcessor();
    const frame = { add: jest.fn() } as unknown as Frame;
    const mockCreate = jest.fn().mockResolvedValue({});
    (
      cp as unknown as { createCardWidget: typeof mockCreate }
    ).createCardWidget = mockCreate;
    const layout = { startX: 0, startY: 0, columns: 1 };
    const defs = [{ title: 'A' }, { title: 'B' }];
    await (
      cp as unknown as {
        createCardWidgets: (
          d: CardData[],
          l: typeof layout,
          m: Map<string, Tag>,
          f?: Frame,
        ) => Promise<unknown[]>;
      }
    ).createCardWidgets(defs as CardData[], layout, new Map(), frame);
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(frame.add).toHaveBeenCalledTimes(2);
  });
});
