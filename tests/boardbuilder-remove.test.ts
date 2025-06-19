import { BoardBuilder } from '../src/BoardBuilder';

describe('BoardBuilder.removeItems', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).miro;
  });

  test('removes provided items from board', async () => {
    const remove = jest.fn();
    (global as any).miro = { board: { remove } };
    const builder = new BoardBuilder();
    const items = [{}, {}];
    await builder.removeItems(items as any);
    expect(remove).toHaveBeenCalledTimes(items.length);
    expect(remove).toHaveBeenCalledWith(items[0]);
    expect(remove).toHaveBeenCalledWith(items[1]);
  });

  test('throws when board not initialized', async () => {
    const builder = new BoardBuilder();
    await expect(builder.removeItems([{} as any])).rejects.toThrow(
      'Miro board not initialized',
    );
  });
});
