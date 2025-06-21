import { CardProcessor } from '../src/board/CardProcessor';
import * as cardModule from '../src/cards';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('CardProcessor', () => {
  let processor: CardProcessor;

  beforeEach(() => {
    processor = new CardProcessor();
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        findEmptySpace: jest.fn().mockResolvedValue({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        }),
        viewport: {
          get: jest.fn().mockResolvedValue({
            x: 0,
            y: 0,
            width: 1000,
            height: 1000,
          }),
          zoomTo: jest.fn(),
        },
        createCard: jest.fn().mockResolvedValue({
          sync: jest.fn(),
          id: 'c1',
          setMetadata: jest.fn(),
        }),
        createTag: jest.fn().mockResolvedValue({ id: 't1' }),
        createFrame: jest.fn().mockResolvedValue({ add: jest.fn(), id: 'f1' }),
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('processFile loads and processes', async () => {
    jest
      .spyOn(cardModule.cardLoader, 'loadCards')
      .mockResolvedValue([{ title: 't' }]);
    const spy = jest
      .spyOn(processor, 'processCards')
      .mockResolvedValue(undefined);
    await processor.processFile({ name: 'cards.json' } as unknown as File);
    expect(cardModule.cardLoader.loadCards).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith([{ title: 't' }], {});
  });

  test('processCards creates cards', async () => {
    await processor.processCards([
      {
        title: 'A',
        tags: [],
        taskStatus: 'done',
        style: { cardTheme: '#fff', fillBackground: true },
        fields: [{ value: 'v' }],
      },
    ]);
    expect(global.miro.board.createCard).toHaveBeenCalled();
    const args = (global.miro.board.createCard as jest.Mock).mock.calls[0][0];
    expect(args.taskStatus).toBe('done');
    expect(args.style).toEqual({ cardTheme: '#fff', fillBackground: true });
    expect(args.fields).toEqual([{ value: 'v' }]);
    expect(global.miro.board.viewport.zoomTo).toHaveBeenCalled();
  });

  test('sets identifier metadata when creating', async () => {
    await processor.processCards([{ id: 'x', title: 'A' }]);
    const card = await (global.miro.board.createCard as jest.Mock).mock
      .results[0].value;
    expect(card.setMetadata).toHaveBeenCalledWith('app.miro.cards', {
      id: 'x',
    });
  });

  test('maps tag names to ids', async () => {
    (global.miro.board.get as jest.Mock).mockImplementation(
      async ({ type }) => {
        if (type === 'tag') return [{ id: '1', title: 'alpha' }];
        return [];
      },
    );
    await processor.processCards([{ title: 'A', tags: ['alpha'] }]);
    const args = (global.miro.board.createCard as jest.Mock).mock.calls[0][0];
    expect(args.tagIds).toEqual(['1']);
  });

  test('creates missing tags', async () => {
    await processor.processCards([{ title: 'A', tags: ['beta'] }]);
    expect(global.miro.board.createTag).toHaveBeenCalledWith({ title: 'beta' });
    const args = (global.miro.board.createCard as jest.Mock).mock.calls[0][0];
    expect(args.tagIds).toEqual(['t1']);
  });

  test('updates card when id matches', async () => {
    const existing = {
      id: 'c2',
      title: 'old',
      fields: [],
      taskStatus: 'to-do',
      getMetadata: jest.fn().mockResolvedValue({ id: 'match' }),
      setMetadata: jest.fn(),
      sync: jest.fn(),
    } as Record<string, unknown>;
    (global.miro.board.get as jest.Mock).mockImplementation(
      async ({ type }) => {
        if (type === 'tag') return [];
        if (type === 'card') return [existing];
        return [];
      },
    );
    await processor.processCards([
      {
        id: 'match',
        title: 'new',
        fields: [{ value: 'z' }],
        style: { cardTheme: '#000', fillBackground: true },
        taskStatus: 'in-progress',
      },
    ]);
    expect(global.miro.board.createCard).not.toHaveBeenCalled();
    expect(existing.title).toBe('new');
    expect(existing.fields).toEqual([{ value: 'z' }]);
    expect(existing.style).toEqual({ cardTheme: '#000', fillBackground: true });
    expect(existing.taskStatus).toBe('in-progress');
    expect(existing.setMetadata).toHaveBeenCalledWith('app.miro.cards', {
      id: 'match',
    });
  });

  test('loads card metadata only once', async () => {
    const existing = {
      id: 'c1',
      title: 'old',
      getMetadata: jest.fn().mockResolvedValue({ id: 'exists' }),
      setMetadata: jest.fn(),
      sync: jest.fn(),
    } as Record<string, unknown>;
    (global.miro.board.get as jest.Mock).mockImplementation(
      async ({ type }) => {
        if (type === 'tag') return [];
        if (type === 'card') return [existing];
        return [];
      },
    );
    await processor.processCards([
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' },
    ]);
    expect(existing.getMetadata).toHaveBeenCalledTimes(1);
  });

  test('skips frame creation when disabled', async () => {
    await processor.processCards([{ title: 'A' }], { createFrame: false });
    expect(global.miro.board.createFrame).not.toHaveBeenCalled();
    expect(global.miro.board.viewport.zoomTo).toHaveBeenCalled();
  });

  test('positions cards in rows', async () => {
    await processor.processCards(
      [{ title: 'A' }, { title: 'B' }, { title: 'C' }, { title: 'D' }],
      { columns: 2 },
    );
    const calls = (global.miro.board.createCard as jest.Mock).mock.calls;
    expect(calls[0][0]).toEqual(expect.objectContaining({ x: -160, y: -44 }));
    expect(calls[1][0]).toEqual(expect.objectContaining({ x: 160, y: -44 }));
    expect(calls[2][0]).toEqual(expect.objectContaining({ x: -160, y: 44 }));
    expect(calls[3][0]).toEqual(expect.objectContaining({ x: 160, y: 44 }));
  });

  test('throws on invalid input', async () => {
    await expect(
      processor.processCards(null as unknown as unknown[]),
    ).rejects.toThrow('Invalid cards');
  });

  test('no cards results in no action', async () => {
    await processor.processCards([]);
    expect(global.miro.board.createCard).not.toHaveBeenCalled();
    expect(global.miro.board.createFrame).not.toHaveBeenCalled();
    expect(global.miro.board.viewport.zoomTo).not.toHaveBeenCalled();
  });

  test('loadCardMap caches board lookups', async () => {
    await (
      processor as unknown as { loadCardMap: () => Promise<void> }
    ).loadCardMap();
    await (
      processor as unknown as { loadCardMap: () => Promise<void> }
    ).loadCardMap();
    expect(global.miro.board.get).toHaveBeenCalledTimes(1);
  });

  test('computeStartCoordinate derives correct origin', () => {
    const margin = (CardProcessor as unknown as { CARD_MARGIN: number })
      .CARD_MARGIN;
    const result = (
      processor as unknown as {
        computeStartCoordinate: (w: number, h: number, s: number) => number;
      }
    ).computeStartCoordinate(200, 400, 100);
    expect(result).toBe(200 - 400 / 2 + margin + 100 / 2);
  });

  test('maybeCreateFrame creates frame when enabled', async () => {
    const builder = {
      createFrame: jest.fn().mockResolvedValue({ id: 'f' }),
      setFrame: jest.fn(),
    } as { createFrame: jest.Mock; setFrame: jest.Mock };
    const p = new CardProcessor(builder as unknown as unknown);
    const dims = { width: 10, height: 20, spot: { x: 1, y: 2 } };
    const frame = await (
      p as unknown as {
        maybeCreateFrame: (
          b: boolean,
          d: unknown,
          t?: string,
        ) => Promise<unknown>;
      }
    ).maybeCreateFrame(true, dims, 't');
    expect(builder.createFrame).toHaveBeenCalledWith(10, 20, 1, 2, 't');
    expect(frame).toEqual({ id: 'f' });
  });

  test('maybeCreateFrame skips frame when disabled', async () => {
    const builder = {
      createFrame: jest.fn(),
      setFrame: jest.fn(),
    } as { createFrame: jest.Mock; setFrame: jest.Mock };
    const p = new CardProcessor(builder as unknown as unknown);
    const dims = { width: 5, height: 5, spot: { x: 0, y: 0 } };
    const frame = await (
      p as unknown as {
        maybeCreateFrame: (b: boolean, d: unknown) => Promise<unknown>;
      }
    ).maybeCreateFrame(false, dims);
    expect(frame).toBeUndefined();
    expect(builder.createFrame).not.toHaveBeenCalled();
    expect(builder.setFrame).toHaveBeenCalledWith(undefined);
  });
});
