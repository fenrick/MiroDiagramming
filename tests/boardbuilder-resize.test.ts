import { BoardBuilder } from '../src/board/board-builder';
import { templateManager } from '../src/board/templates';
import type { BaseItem, GroupableItem } from '@mirohq/websdk-types';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('BoardBuilder resizeItem', () => {
  test('updates width and height and syncs', async () => {
    const builder = new BoardBuilder();
    const item = {
      width: 1,
      height: 2,
      sync: jest.fn(),
    } as Partial<BaseItem> & { sync: jest.Mock };
    await builder.resizeItem(item as unknown as BaseItem, 10, 20);
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
      { id: 'n', label: 'L', type: 'Role' } as {
        id: string;
        label: string;
        type: string;
      },
      { x: 0, y: 0, width: 50, height: 40 },
    );
    expect(spy).toHaveBeenCalled();
  });

  test('groupItems groups widgets together', async () => {
    const builder = new BoardBuilder();
    global.miro = {
      board: {
        group: jest.fn().mockResolvedValue({ id: 'g1', type: 'group' }),
      },
    } as unknown as GlobalWithMiro;
    const a = { id: 'a' } as unknown as BaseItem;
    const b = { id: 'b' } as unknown as BaseItem;
    const group = await builder.groupItems([
      a as unknown as GroupableItem,
      b as unknown as GroupableItem,
    ]);
    expect((global.miro.board.group as jest.Mock).mock.calls[0][0]).toEqual({
      items: [a, b],
    });
    expect(group.id).toBe('g1');
    delete global.miro;
  });
});
