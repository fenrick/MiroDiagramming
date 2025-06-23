import { GraphProcessor } from '../src/core/graph/graph-processor';
import { CardProcessor } from '../src/board/card-processor';
import { BoardBuilder } from '../src/board/board-builder';

describe('undo operations', () => {
  test('GraphProcessor.undoLast removes widgets', async () => {
    const builder = new BoardBuilder();
    const remove = jest.spyOn(builder, 'removeItems').mockResolvedValue();
    const gp = new GraphProcessor(builder);
    (gp as unknown as { lastCreated: unknown[] }).lastCreated = [1 as unknown];
    await gp.undoLast();
    expect(remove).toHaveBeenCalledWith([1]);
  });

  test('CardProcessor.undoLast removes cards', async () => {
    const builder = new BoardBuilder();
    const remove = jest.spyOn(builder, 'removeItems').mockResolvedValue();
    const cp = new CardProcessor(builder);
    (cp as unknown as { lastCreated: unknown[] }).lastCreated = [1 as unknown];
    await cp.undoLast();
    expect(remove).toHaveBeenCalledWith([1]);
  });

  test('CardProcessor.undoLast handles empty list', async () => {
    const builder = new BoardBuilder();
    const remove = jest.spyOn(builder, 'removeItems').mockResolvedValue();
    const cp = new CardProcessor(builder);
    (cp as unknown as { lastCreated: unknown[] }).lastCreated = [];
    await cp.undoLast();
    expect(remove).not.toHaveBeenCalled();
  });

  test('GraphProcessor.undoLast handles empty list', async () => {
    const builder = new BoardBuilder();
    const remove = jest.spyOn(builder, 'removeItems').mockResolvedValue();
    const gp = new GraphProcessor(builder);
    (gp as unknown as { lastCreated: unknown[] }).lastCreated = [];
    await gp.undoLast();
    expect(remove).not.toHaveBeenCalled();
  });
});
