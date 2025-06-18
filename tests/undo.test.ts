import { GraphProcessor } from '../src/GraphProcessor';
import { CardProcessor } from '../src/CardProcessor';
import { BoardBuilder } from '../src/BoardBuilder';

describe('undo operations', () => {
  test('GraphProcessor.undoLast removes widgets', async () => {
    const builder = new BoardBuilder();
    const remove = jest.spyOn(builder, 'removeItems').mockResolvedValue();
    const gp = new GraphProcessor(builder);
    (gp as any).lastCreated = [1 as any];
    await gp.undoLast();
    expect(remove).toHaveBeenCalledWith([1]);
  });

  test('CardProcessor.undoLast removes cards', async () => {
    const builder = new BoardBuilder();
    const remove = jest.spyOn(builder, 'removeItems').mockResolvedValue();
    const cp = new CardProcessor(builder);
    (cp as any).lastCreated = [1 as any];
    await cp.undoLast();
    expect(remove).toHaveBeenCalledWith([1]);
  });
});
