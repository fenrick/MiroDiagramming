import { BoardBuilder } from '../src/board/board-builder';
import { templateManager } from '../src/board/templates';

describe('BoardBuilder resizeItem', () => {
  test('updates width and height and syncs', async () => {
    const builder = new BoardBuilder();
    const item = { width: 1, height: 2, sync: jest.fn() } as unknown as Record<
      string,
      unknown
    >;
    await builder.resizeItem(item as any, 10, 20);
    expect(item.width).toBe(10);
    expect(item.height).toBe(20);
    expect(item.sync).toHaveBeenCalled();
  });

  test('createNode applies layout size', async () => {
    const builder = new BoardBuilder();
    jest.spyOn(builder, 'findNode').mockResolvedValue(undefined);
    jest
      .spyOn(templateManager, 'getTemplate')
      .mockReturnValue({
        elements: [{ shape: 'rect', width: 10, height: 10 }],
      });
    jest
      .spyOn(templateManager, 'createFromTemplate')
      .mockResolvedValue({
        type: 'shape',
        setMetadata: jest.fn(),
        sync: jest.fn(),
        id: 's',
      } as unknown as Record<string, unknown>);
    const spy = jest.spyOn(builder, 'resizeItem').mockResolvedValue();
    await builder.createNode(
      { id: 'n', label: 'L', type: 'Role' } as unknown as Record<
        string,
        unknown
      >,
      { x: 0, y: 0, width: 50, height: 40 },
    );
    expect(spy).toHaveBeenCalled();
  });
});
