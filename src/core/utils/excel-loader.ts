import ExcelJS from 'exceljs';
import { fileUtils } from './file-utils';
import { GraphClient, graphClient } from './graph-client';

/** Row object produced from a worksheet. */
export interface ExcelRow {
  [key: string]: unknown;
}

/**
 * Lightweight Excel file loader built around the `exceljs` library.
 *
 * The loader parses `.xlsx`/`.xls` files, exposing sheet and table accessors.
 * Rows are returned as objects keyed by column headers.
 */
export class ExcelLoader {
  private workbook: ExcelJS.Workbook | null = null;

  /** Parse a workbook from raw array buffer data. */
  public async loadArrayBuffer(buffer: ArrayBuffer): Promise<void> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    this.workbook = wb;
  }

  /**
   * Load a workbook from a {@link File} instance.
   *
   * @param file - Excel file to parse.
   */
  public async loadWorkbook(file: File): Promise<void> {
    fileUtils.validateFile(file);
    const buffer = await file.arrayBuffer();
    await this.loadArrayBuffer(buffer);
  }

  /** List worksheet names from the current workbook. */
  public listSheets(): string[] {
    return this.workbook ? this.workbook.worksheets.map((ws) => ws.name) : [];
  }

  /** List named table ranges from the current workbook. */
  public listNamedTables(): string[] {
    return this.workbook?.definedNames.model.map((n) => n.name) ?? [];
  }

  /**
   * Load rows from a specific worksheet.
   *
   * @param name - Sheet name as listed by {@link listSheets}.
   * @returns Array of row objects keyed by column headers.
   */
  public loadSheet(name: string): ExcelRow[] {
    const ws = this.getSheet(name);
    return this.extractRows(ws);
  }

  /**
   * Load rows from a named table defined within the workbook.
   *
   * @param name - Name of the table/range.
   * @returns Array of row objects keyed by column headers.
   */
  public loadNamedTable(name: string): ExcelRow[] {
    if (!this.workbook) throw new Error('Workbook not loaded');
    const entry = this.workbook.definedNames.getRanges(name);
    const ref = entry.ranges[0];
    if (!ref) throw new Error(`Unknown table: ${name}`);
    const [sheetName, range] = ref.replace(/'/g, '').split('!');
    const ws = this.workbook.getWorksheet(sheetName);
    if (!ws) throw new Error(`Missing sheet for table: ${name}`);
    return this.extractRows(ws, range);
  }

  /** Retrieve a worksheet object, throwing on missing sheet. */
  private getSheet(name: string): ExcelJS.Worksheet {
    if (!this.workbook) throw new Error('Workbook not loaded');
    const ws = this.workbook.getWorksheet(name);
    if (!ws) throw new Error(`Unknown sheet: ${name}`);
    return ws;
  }

  private extractRows(ws: ExcelJS.Worksheet, range?: string): ExcelRow[] {
    const { start, end } = this.parseRange(range, ws);
    const headers = [] as string[];
    for (let c = start.col; c <= end.col; c++) {
      headers.push(String(ws.getRow(start.row).getCell(c).value ?? ''));
    }
    const rows: ExcelRow[] = [];
    for (let r = start.row + 1; r <= end.row; r++) {
      const row: ExcelRow = {};
      for (let c = start.col; c <= end.col; c++) {
        row[headers[c - start.col]] = ws.getRow(r).getCell(c).value ?? null;
      }
      rows.push(row);
    }
    return rows;
  }

  private parseRange(
    ref: string | undefined,
    ws: ExcelJS.Worksheet,
  ): {
    start: { row: number; col: number };
    end: { row: number; col: number };
  } {
    if (!ref) {
      return {
        start: { row: 1, col: 1 },
        end: { row: ws.rowCount, col: ws.columnCount },
      };
    }
    const clean = ref.replace(/\$/g, '');
    const rangeRegex = /([A-Z]+)(\d+):([A-Z]+)(\d+)/i;
    const match = rangeRegex.exec(clean);
    if (!match) throw new Error(`Invalid range: ${ref}`);
    const [, sCol, sRow, eCol, eRow] = match;
    const colNum = (col: string) =>
      col
        .toUpperCase()
        .split('')
        .reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
    return {
      start: { row: Number(sRow), col: colNum(sCol) },
      end: { row: Number(eRow), col: colNum(eCol) },
    };
  }
}

/** Shared instance to avoid repetitive class creation. */
export const excelLoader = new ExcelLoader();

/**
 * Excel loader capable of fetching workbooks from OneDrive or SharePoint.
 */
export class GraphExcelLoader extends ExcelLoader {
  constructor(private readonly client: GraphClient = graphClient) {
    super();
  }

  /**
   * Load a workbook using the Microsoft Graph API.
   *
   * @param identifier - File share URL or drive item ID.
   */
  public async loadWorkbookFromGraph(identifier: string): Promise<void> {
    const buffer = await this.client.fetchFile(identifier);
    await this.loadArrayBuffer(buffer);
  }
}

/** Shared instance for Graph-based loading. */
export const graphExcelLoader = new GraphExcelLoader();
