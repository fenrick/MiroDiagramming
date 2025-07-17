import { UndoableProcessor } from '../fenrick.miro.ux/src/core/graph/undoable-processor';
import { BoardBuilder } from '../fenrick.miro.ux/src/board/board-builder';
import type { BaseItem } from '@mirohq/websdk-types';

class Dummy extends UndoableProcessor<BaseItem> {
  public add(item: BaseItem | BaseItem[]): void {
    this.registerCreated(item);
  }

  public async doSync(items: BaseItem[]): Promise<void> {
    await this.syncOrUndo(items);
  }

  constructor(builder: BoardBuilder) {
    super(builder);
  }
}

describe('UndoableProcessor', () => {
  test('undoLast removes widgets', async () => {
    const builder = new BoardBuilder();
    const remove = jest.spyOn(builder, 'removeItems').mockResolvedValue();
    const proc = new Dummy(builder);
    const item = {} as BaseItem;
    proc.add(item);
    await proc.undoLast();
    expect(remove).toHaveBeenCalledWith([item]);
  });

  test('undoLast handles empty list', async () => {
    const builder = new BoardBuilder();
    const remove = jest.spyOn(builder, 'removeItems').mockResolvedValue();
    const proc = new Dummy(builder);
    await proc.undoLast();
    expect(remove).not.toHaveBeenCalled();
  });

  test('registerCreated accumulates items', () => {
    const proc = new Dummy(new BoardBuilder());
    proc.add({} as BaseItem);
    proc.add([{} as BaseItem, {} as BaseItem]);
    expect(proc.getLastCreated()).toHaveLength(3);
  });

  test('syncOrUndo rolls back on failure', async () => {
    const builder = new BoardBuilder();
    const sync = jest
      .spyOn(builder, 'syncAll')
      .mockRejectedValue(new Error('fail'));
    const remove = jest.spyOn(builder, 'removeItems').mockResolvedValue();
    const proc = new Dummy(builder);
    proc.add({} as BaseItem);
    await expect(proc.doSync([{} as BaseItem])).rejects.toThrow('fail');
    expect(sync).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
  });
});
