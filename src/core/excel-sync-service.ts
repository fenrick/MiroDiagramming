import { mapRowsToNodes, ColumnMapping } from './data-mapper';
import type { ExcelRow } from './utils/excel-loader';
import { templateManager } from '../board/templates';
import { applyElementToItem } from '../board/element-utils';
import type { BaseItem, Group, Json } from '@mirohq/websdk-types';

/** Metadata key used to store Excel row identifiers. */
const META_KEY = 'app.miro.excel';

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
      if (!rowId) continue;
      const idStr = String(rowId);
      const widget = await this.findWidget(idStr);
      if (!widget) continue;
      await this.applyTemplate(widget, def.label, def.type, {
        ...(def.metadata ?? {}),
        rowId: idStr,
      });
      this.registerMapping(idStr, widget.id ?? '');
    }
  }

  /**
   * Extract widget values and write them back to Excel rows.
   * Any metadata stored under {@link META_KEY} is copied according to the
   * {@link ColumnMapping.metadataColumns} configuration.
   *
   * @param rows - Workbook rows to update.
   * @param mapping - Column mapping describing identifiers and labels.
   * @returns Updated rows with widget text and metadata applied.
   */
  // eslint-disable-next-line complexity
  public async pushChangesToExcel(
    rows: ExcelRow[],
    mapping: ColumnMapping,
  ): Promise<ExcelRow[]> {
    const updated: ExcelRow[] = [];
    const metaCols = mapping.metadataColumns ?? {};
    for (const [i, r] of rows.entries()) {
      const row = { ...r };
      const rowId = mapping.idColumn ? row[mapping.idColumn] : undefined;
      const idStr = String(rowId ?? i);
      const widget = await this.findWidget(idStr);
      if (widget) {
        const item = await this.extractItem(widget);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content = (item as any).content as string | undefined;
        if (mapping.labelColumn && content) {
          row[mapping.labelColumn] = content;
        }
        const meta = (await item.getMetadata(META_KEY)) as
          | Record<string, unknown>
          | undefined;
        if (mapping.textColumn && meta?.text != null) {
          row[mapping.textColumn] = meta.text;
        }
        Object.keys(metaCols).forEach((key) => {
          if (meta?.[key] != null) {
            row[metaCols[key]] = meta[key];
          }
        });
        this.registerMapping(idStr, widget.id ?? '');
      }
      updated.push(row);
    }
    return updated;
  }

  /** Locate a widget by rowId using board metadata. */
  private async findWidget(
    rowId: string,
  ): Promise<BaseItem | Group | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const board: any = miro.board;
    const shapes = (await board.get({ type: 'shape' })) as BaseItem[];
    const foundShape = await this.findByMetadata(shapes, rowId);
    if (foundShape) return foundShape;
    const groups = (await board.get({ type: 'group' })) as Group[];
    for (const group of groups) {
      const items = await (group as unknown as Group).getItems();
      if (!Array.isArray(items)) continue;
      const found = await this.findByMetadata(items as BaseItem[], rowId);
      if (found) return group;
    }
    return undefined;
  }

  /**
   * Update widget content and style based on the provided template.
   * The metadata object is written to the widget using {@link META_KEY}.
   */
  private async applyTemplate(
    widget: BaseItem | Group,
    label: string,
    templateName: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    const template = templateManager.getTemplate(templateName);
    if (!template) return;
    const items =
      widget.type === 'group'
        ? await (widget as unknown as Group).getItems()
        : [widget];
    template.elements.forEach((el, idx) => {
      if (items[idx]) {
        applyElementToItem(items[idx] as BaseItem, el, label);
      }
    });
    const meta = { ...metadata };
    if (metadata.rowId != null) meta.rowId = String(metadata.rowId);
    const master = template.masterElement;
    if (widget.type === 'group') {
      const groupItems = items as BaseItem[];
      if (master !== undefined && groupItems[master]) {
        await groupItems[master].setMetadata(META_KEY, meta as Json);
      } else {
        await Promise.all(
          groupItems.map((i) => i.setMetadata(META_KEY, meta as Json)),
        );
      }
    } else {
      await (widget as BaseItem).setMetadata(META_KEY, meta as Json);
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
  private async findByMetadata<
    T extends { getMetadata: (k: string) => Promise<unknown> },
  >(items: T[], rowId: string): Promise<T | undefined> {
    const metas = await Promise.all(items.map((i) => i.getMetadata(META_KEY)));
    for (const [i, metaVal] of metas.entries()) {
      const meta = metaVal as { rowId?: string };
      if (meta?.rowId === rowId) {
        return items[i];
      }
    }
    return undefined;
  }
}
