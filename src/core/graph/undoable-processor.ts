import type { BaseItem, Connector, Frame, Group } from '@mirohq/websdk-types';
import { BoardBuilder } from '../../board/board-builder';
import { undoWidgets, syncOrUndo as syncHelper } from '../../board/undo-utils';

/**
 * Base class that tracks widgets created during a processing run and
 * provides undo and sync helpers.
 */
export abstract class UndoableProcessor<
  T extends BaseItem | Group | Connector | Frame =
    | BaseItem
    | Group
    | Connector
    | Frame,
> {
  protected lastCreated: T[] = [];

  constructor(protected readonly builder: BoardBuilder) {}

  /**
   * Access widgets created in the most recent run.
   */
  public getLastCreated(): T[] {
    return this.lastCreated;
  }

  /**
   * Register newly created widget(s) for later undo.
   */
  protected registerCreated(item: T | T[]): void {
    if (Array.isArray(item)) {
      this.lastCreated.push(...item);
    } else {
      this.lastCreated.push(item);
    }
  }

  /**
   * Remove widgets created during the last run from the board.
   */
  public async undoLast(): Promise<void> {
    await undoWidgets(
      this.builder,
      this.lastCreated as Array<BaseItem | Group | Connector | Frame>,
    );
  }

  /**
   * Sync widgets and roll back on failure.
   */
  protected async syncOrUndo(
    items: Array<BaseItem | Group | Connector>,
  ): Promise<void> {
    await syncHelper(
      this.builder,
      this.lastCreated as Array<BaseItem | Group | Connector | Frame>,
      items,
    );
  }
}
