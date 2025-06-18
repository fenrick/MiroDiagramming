import { CardProcessor } from '../src/CardProcessor';
import * as cardModule from '../src/cards';

declare const global: any;

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
        createFrame: jest.fn().mockResolvedValue({ add: jest.fn(), id: 'f1' }),
        createTag: jest.fn().mockResolvedValue({ id: 't1' }),
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('processFile loads and processes', async () => {
    jest.spyOn(cardModule, 'loadCards').mockResolvedValue([{ title: 't' }]);
    const spy = jest
      .spyOn(processor, 'processCards')
      .mockResolvedValue(undefined);
    await processor.processFile({ name: 'cards.json' } as any);
    expect(cardModule.loadCards).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith([{ title: 't' }], {});
  });

  test('processCards creates cards', async () => {
    await processor.processCards([{ title: 'A', tags: [] }]);
    expect(global.miro.board.createCard).toHaveBeenCalled();
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
    (global.miro.board.get as jest.Mock).mockResolvedValue([
      { id: '1', title: 'alpha' },
    ]);
    await processor.processCards([{ title: 'A', tags: ['alpha'] }]);
    const args = (global.miro.board.createCard as jest.Mock).mock.calls[0][0];
    expect(args.tagIds).toEqual(['1']);
  });

  test('creates missing tags', async () => {
    (global.miro.board.get as jest.Mock).mockResolvedValue([]);
    (global.miro.board.createTag as jest.Mock).mockResolvedValue({
      id: '2',
      title: 'beta',
    });
    await processor.processCards([{ title: 'B', tags: ['beta'] }]);
    expect(global.miro.board.createTag).toHaveBeenCalledWith({ title: 'beta' });
    const args = (global.miro.board.createCard as jest.Mock).mock.calls[0][0];
    expect(args.tagIds).toEqual(['2']);
  });

  test('updates card when id matches', async () => {
    const existing = {
      id: 'c2',
      title: 'old',
      getMetadata: jest.fn().mockResolvedValue({ id: 'match' }),
      setMetadata: jest.fn(),
      sync: jest.fn(),
    } as any;
    (global.miro.board.get as jest.Mock).mockImplementation(
      async ({ type }) => {
        if (type === 'tag') return [];
        if (type === 'card') return [existing];
        return [];
      },
    );
    await processor.processCards([{ id: 'match', title: 'new' }]);
    expect(global.miro.board.createCard).not.toHaveBeenCalled();
    expect(existing.title).toBe('new');
    expect(existing.setMetadata).toHaveBeenCalledWith('app.miro.cards', {
      id: 'match',
    });
  });

  test('skips frame creation when disabled', async () => {
    await processor.processCards([{ title: 'A' }], { createFrame: false });
    expect(global.miro.board.createFrame).not.toHaveBeenCalled();
    expect(global.miro.board.viewport.zoomTo).toHaveBeenCalled();
  });

  test('throws on invalid input', async () => {
    await expect(processor.processCards(null as any)).rejects.toThrow(
      'Invalid cards',
    );
  });
});
