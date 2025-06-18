import { CardProcessor } from '../src/CardProcessor';
import * as cardModule from '../src/cards';

declare const global: any;

describe('CardProcessor', () => {
  const processor = new CardProcessor();

  beforeEach(() => {
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
        createCard: jest.fn().mockResolvedValue({ sync: jest.fn(), id: 'c1' }),
        createFrame: jest.fn().mockResolvedValue({ add: jest.fn(), id: 'f1' }),
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

  test('maps tag names to ids', async () => {
    (global.miro.board.get as jest.Mock).mockResolvedValue([
      { id: '1', title: 'alpha' },
    ]);
    await processor.processCards([{ title: 'A', tags: ['alpha'] }]);
    const args = (global.miro.board.createCard as jest.Mock).mock.calls[0][0];
    expect(args.tagIds).toEqual(['1']);
  });

  test('skips frame creation when disabled', async () => {
    await processor.processCards([{ title: 'A' }], { createFrame: false });
    expect(global.miro.board.createFrame).not.toHaveBeenCalled();
    expect(global.miro.board.viewport.zoomTo).toHaveBeenCalled();
  });

  test('throws on invalid input', async () => {
    await expect(processor.processCards(null as any)).rejects.toThrow(
      'Invalid cards'
    );
  });
});
