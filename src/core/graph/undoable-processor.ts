import { type BoardBuilder } from '../../board/board-builder'
import type { BoardEntity } from '../../board/item-types'
import { syncOrUndo as syncHelper, undoWidgets } from '../../board/undo-utilities'

/**
 * Base class that tracks widgets created during a processing run and
 * provides undo and sync helpers.
 */
type ItemCollection<T> = T | T[]

export abstract class UndoableProcessor<T extends BoardEntity = BoardEntity> {
  protected lastCreated: T[] = []

  constructor(protected readonly builder: BoardBuilder) {}

  /**
   * Access widgets created in the most recent run.
   */
  public getLastCreated(): T[] {
    return this.lastCreated
  }

  /**
   * Remove widgets created during the last run from the board.
   */
  public async undoLast(): Promise<void> {
    await undoWidgets(this.builder, this.lastCreated as BoardEntity[])
  }

  /**
   * Register newly created widget(s) for later undo.
   */
  protected registerCreated(item: ItemCollection<T>): void {
    if (Array.isArray(item)) {
      this.lastCreated.push(...item)
    } else {
      this.lastCreated.push(item)
    }
  }

  /**
   * Sync widgets and roll back on failure.
   */
  protected async syncOrUndo(items: BoardEntity[]): Promise<void> {
    await syncHelper(this.builder, this.lastCreated as BoardEntity[], items)
  }
}
