import { CardProcessor } from '../src/CardProcessor';

/** Additional branch coverage for CardProcessor */

describe('CardProcessor branches', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).miro;
  });

  test('getBoardCards caches board fetches', async () => {
    const board = { get: jest.fn().mockResolvedValue([]) };
    (global as any).miro = { board };
    const cp = new CardProcessor();
    await (cp as any).getBoardCards();
    await (cp as any).getBoardCards();
    expect(board.get).toHaveBeenCalledTimes(1);
  });

  test('loadCardMap ignores cards without id metadata', async () => {
    const card = {
      getMetadata: jest.fn().mockResolvedValue({}),
      id: '1',
    } as any;
    (global as any).miro = {
      board: { get: jest.fn().mockResolvedValue([card]) },
    };
    const cp = new CardProcessor();
    const map = await (cp as any).loadCardMap();
    expect(map.size).toBe(0);
  });

  test('ensureTagIds skips tag with no id', async () => {
    const cp = new CardProcessor();
    (global as any).miro = { board: { createTag: jest.fn() } };
    const tagMap = new Map([['x', { title: 'x' } as any]]);
    const ids = await (cp as any).ensureTagIds(['x'], tagMap);
    expect(ids).toEqual([]);
  });

  test('updateCardWidget leaves taskStatus when undefined', async () => {
    const cp = new CardProcessor();
    (cp as any).ensureTagIds = jest.fn().mockResolvedValue([]);
    const card: any = { taskStatus: 'old', setMetadata: jest.fn() };
    await (cp as any).updateCardWidget(
      card,
      { id: '1', title: 't' },
      new Map(),
    );
    expect(card.taskStatus).toBe('old');
    expect(card.setMetadata).toHaveBeenCalledWith('app.miro.cards', {
      id: '1',
    });
  });
});
