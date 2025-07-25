import type { BaseItem, Group } from '@mirohq/websdk-types';
import type { BoardQueryLike } from '../board/board';
import { applyElementToItem } from '../board/element-utils';
import { searchGroups, searchShapes } from '../board/node-search';
import { templateManager } from '../board/templates';
import { ColumnMapping, mapRowsToNodes } from './data-mapper';
import type { ExcelRow } from './utils/excel-loader';
import { toSafeString } from './utils/string-utils';

/** Item supporting text content on the board. */
export interface ContentItem extends BaseItem {
  /** Text value of the widget. */
  content?: string;
}

/**
 * Service providing two-way synchronisation between Excel workbooks
 * and diagram widgets on the board.
 */
export class ExcelSyncService {
  private rowMap: Record<string, string> = {};

  /** Clear the internal row mapping. */
  public reset(): void {
    this.rowMap = {};
  }

  /**
   * Register a row-to-widget mapping.
   *
   * @param rowId - Identifier of the workbook row.
   * @param widgetId - Corresponding widget identifier.
   */
  public registerMapping(rowId: string, widgetId: string): void {
    this.rowMap[rowId] = widgetId;
  }

  /** Retrieve the widget identifier for the given row. */
  public getWidgetId(rowId: string): string | undefined {
    return this.rowMap[rowId];
  }

  /**
   * Update existing widgets using values from the provided rows.
   * Metadata from each row is written to the widget using
   * {@link ColumnMapping.metadataColumns}.
   *
   * @param rows - Workbook rows.
   * @param mapping - Column mapping describing identifiers and labels.
   */
  public async updateShapesFromExcel(
    rows: ExcelRow[],
    mapping: ColumnMapping,
  ): Promise<void> {
    const nodes = mapRowsToNodes(rows, mapping);
    for (const def of nodes) {
      const rowId = def.metadata?.rowId;
      if (!rowId) {
        continue;
      }
      const idStr = toSafeString(rowId);
      const widget = await this.findWidget(idStr, def.label);
      if (!widget) {
        continue;
      }
      await this.applyTemplate(widget, def.label, def.type);
      this.registerMapping(idStr, widget.id ?? '');
    }
  }

  /**
   * Extract widget values and write them back to Excel rows.
   * Embedded metadata is copied according to the
   * {@link ColumnMapping.metadataColumns} configuration.
   *
   * @param rows - Workbook rows to update.
   * @param mapping - Column mapping describing identifiers and labels.
   * @returns Updated rows with widget text and metadata applied.
   */
  public async pushChangesToExcel(
    rows: ExcelRow[],
    mapping: ColumnMapping,
  ): Promise<ExcelRow[]> {
    const updated: ExcelRow[] = [];
    for (const [i, r] of rows.entries()) {
      const rowId = mapping.idColumn ? r[mapping.idColumn] : undefined;
      const idStr = toSafeString(rowId ?? i);
      const label = mapping.labelColumn
        ? toSafeString(r[mapping.labelColumn])
        : '';
      const widget = await this.lookupWidget(idStr, label);
      let row = { ...r };
      if (widget) {
        const data = await this.extractWidgetData(widget);
        row = this.updateRowFromWidget(row, mapping, data);
        this.registerMapping(idStr, widget.id ?? '');
      }
      updated.push(row);
    }
    return updated;
  }

  /** Retrieve the widget corresponding to the given identifier. */
  private async lookupWidget(
    idStr: string,
    label: string,
  ): Promise<BaseItem | Group | undefined> {
    return this.findWidget(idStr, label);
  }

  /**
   * Extract content and metadata from a widget.
   *
   * @param widget - Widget to inspect.
   * @returns Widget text content and metadata.
   */
  private async extractWidgetData(
    widget: BaseItem | Group,
  ): Promise<{ content?: string; meta?: Record<string, unknown> }> {
    const item = (await this.extractItem(widget)) as ContentItem;
    const content = item.content ?? '';
    return { content };
  }

  /**
   * Merge widget data into an Excel row according to the mapping.
   *
   * @param row - Row to update.
   * @param mapping - Column mapping describing identifiers and labels.
   * @param data - Extracted widget content and metadata.
   * @returns Updated row with merged values.
   */
  private updateRowFromWidget(
    row: ExcelRow,
    mapping: ColumnMapping,
    data: { content?: string },
  ): ExcelRow {
    const updated = { ...row };
    if (mapping.labelColumn && data.content) {
      updated[mapping.labelColumn] = data.content;
    }
    return updated;
  }

  /** Locate a widget by row identifier or label text. */
  private async findWidget(
    rowId: string,
    label: string,
  ): Promise<BaseItem | Group | undefined> {
    const byId = this.rowMap[rowId];
    if (byId) {
      try {
        // TODO lookup widget via ShapeClient + cache rather than board.getById
        const item = (await miro.board.getById(byId)) as BaseItem | Group;
        if (item) {
          return item;
        }
      } catch {
        // ignore stale mapping
      }
    }
    const board = miro.board as unknown as BoardQueryLike;
    const shape = await searchShapes(board, undefined, label);
    if (shape) {
      return shape;
    }
    return searchGroups(board, '', label);
  }

  /**
   * Update widget content and style based on the provided template.
   * Metadata is embedded in the widget text.
   */
  private async applyTemplate(
    widget: BaseItem | Group,
    label: string,
    templateName: string,
  ): Promise<void> {
    const template = templateManager.getTemplate(templateName);
    if (!template) {
      return;
    }
    const items =
      widget.type === 'group'
        ? await (widget as unknown as Group).getItems()
        : [widget];
    template.elements.forEach((el, idx) => {
      if (items[idx]) {
        applyElementToItem(items[idx] as BaseItem, el, label);
      }
    });
    const master = template.masterElement ?? 0;
    const target = items[master] as ContentItem | undefined;
    if (target) {
      target.content = label;
    }
  }

  /** Retrieve the first item of a widget for text extraction. */
  private async extractItem(widget: BaseItem | Group): Promise<BaseItem> {
    if (widget.type === 'group') {
      const items = await (widget as unknown as Group).getItems();
      return items[0] as BaseItem;
    }
    return widget as BaseItem;
  }

  /** Search an item list for matching metadata. */
}
