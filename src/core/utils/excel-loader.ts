import * as XLSX from 'xlsx';
import { fileUtils } from './file-utils';
import { GraphClient, graphClient } from './graph-client';

/** Row object produced from a worksheet. */
export interface ExcelRow {
  [key: string]: unknown;
}

/**
 * Lightweight Excel file loader built around the `xlsx` library.
 *
 * The loader parses `.xlsx`/`.xls` files, exposing sheet and table accessors.
 * Rows are returned as objects keyed by column headers.
 */
export class ExcelLoader {
  private workbook: XLSX.WorkBook | null = null;

  /** Parse a workbook from raw array buffer data. */
  public loadArrayBuffer(buffer: ArrayBuffer): void {
    this.workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  }

  /**
   * Load a workbook from a {@link File} instance.
   *
   * @param file - Excel file to parse.
   */
  public async loadWorkbook(file: File): Promise<void> {
    fileUtils.validateFile(file);
    const buffer = await file.arrayBuffer();
    this.loadArrayBuffer(buffer);
  }

  /** List worksheet names from the current workbook. */
  public listSheets(): string[] {
    return this.workbook ? [...this.workbook.SheetNames] : [];
  }

  /** List named table ranges from the current workbook. */
  public listNamedTables(): string[] {
    return this.workbook?.Workbook?.Names?.map((n) => n.Name) ?? [];
  }

  /**
   * Load rows from a specific worksheet.
   *
   * @param name - Sheet name as listed by {@link listSheets}.
   * @returns Array of row objects keyed by column headers.
   */
  public loadSheet(name: string): ExcelRow[] {
    const ws = this.getSheet(name);
    return XLSX.utils.sheet_to_json<ExcelRow>(ws, { defval: null });
  }

  /**
   * Load rows from a named table defined within the workbook.
   *
   * @param name - Name of the table/range.
   * @returns Array of row objects keyed by column headers.
   */
  public loadNamedTable(name: string): ExcelRow[] {
    if (!this.workbook) throw new Error('Workbook not loaded');
    const named = this.workbook.Workbook?.Names?.find((n) => n.Name === name);
    if (!named || !named.Ref) throw new Error(`Unknown table: ${name}`);
    const [sheetName, range] = named.Ref.replace(/'/g, '').split('!');
    const ws = this.workbook.Sheets[sheetName];
    if (!ws) throw new Error(`Missing sheet for table: ${name}`);
    return XLSX.utils.sheet_to_json<ExcelRow>(ws, { range, defval: null });
  }

  /** Retrieve a worksheet object, throwing on missing sheet. */
  private getSheet(name: string): XLSX.WorkSheet {
    if (!this.workbook) throw new Error('Workbook not loaded');
    const ws = this.workbook.Sheets[name];
    if (!ws) throw new Error(`Unknown sheet: ${name}`);
    return ws;
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
    this.loadArrayBuffer(buffer);
  }
}

/** Shared instance for Graph-based loading. */
export const graphExcelLoader = new GraphExcelLoader();
