/** @vitest-environment jsdom */
import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { ExcelLoader } from '../src/core/utils/excel-loader';

function createFile(): File {
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet([
    ['A', 'B'],
    [1, 2],
    [3, 4],
  ]);
  XLSX.utils.book_append_sheet(wb, ws1, 'Sheet1');

  const ws2 = XLSX.utils.aoa_to_sheet([
    ['X', 'Y'],
    [5, 6],
  ]);
  XLSX.utils.book_append_sheet(wb, ws2, 'Sheet2');

  wb.Workbook = { Names: [{ Name: 'Table1', Ref: 'Sheet2!A1:B2' }] };

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return {
    name: 'test.xlsx',
    async arrayBuffer() {
      return buf;
    },
  } as unknown as File;
}

function readFixtureFile(): File {
  const buf = readFileSync('tests/fixtures/sample.xlsx');
  return {
    name: 'sample.xlsx',
    async arrayBuffer() {
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    },
  } as unknown as File;
}

describe('excel loader', () => {
  let file: File;

  beforeAll(() => {
    file = createFile();
  });

  test('loads workbook and lists sheets', async () => {
    const loader = new ExcelLoader();
    await loader.loadWorkbook(file);
    expect(loader.listSheets()).toEqual(['Sheet1', 'Sheet2']);
    expect(loader.listNamedTables()).toEqual(['Table1']);
  });

  test('loads rows from a sheet', async () => {
    const loader = new ExcelLoader();
    await loader.loadWorkbook(file);
    const rows = loader.loadSheet('Sheet1');
    expect(rows).toEqual([
      { A: 1, B: 2 },
      { A: 3, B: 4 },
    ]);
  });

  test('loads rows from a named table', async () => {
    const loader = new ExcelLoader();
    await loader.loadWorkbook(file);
    const rows = loader.loadNamedTable('Table1');
    expect(rows).toEqual([{ X: 5, Y: 6 }]);
  });

  test('throws on unknown sheet', async () => {
    const loader = new ExcelLoader();
    await loader.loadWorkbook(file);
    expect(() => loader.loadSheet('Unknown')).toThrow('Unknown sheet');
  });

  test('throws on unknown table', async () => {
    const loader = new ExcelLoader();
    await loader.loadWorkbook(file);
    expect(() => loader.loadNamedTable('Missing')).toThrow('Unknown table');
  });

  test('validateFile catches invalid objects', async () => {
    const loader = new ExcelLoader();
    const invalid = {
      async arrayBuffer() {
        return new ArrayBuffer(0);
      },
    } as unknown as File;
    await expect(loader.loadWorkbook(invalid)).rejects.toThrow('Invalid file');
  });

  test('loads workbook from fixture file', async () => {
    const loader = new ExcelLoader();
    const fixture = readFixtureFile();
    await loader.loadWorkbook(fixture);
    expect(loader.listSheets()).toEqual(['Sheet1', 'Sheet2']);
    const rows = loader.loadNamedTable('Table1');
    expect(rows).toEqual([{ X: 5, Y: 6 }]);
  });

  test('methods fail when workbook not loaded', () => {
    const loader = new ExcelLoader();
    expect(loader.listSheets()).toEqual([]);
    expect(loader.listNamedTables()).toEqual([]);
    expect(() => loader.loadSheet('Sheet1')).toThrow('Workbook not loaded');
    expect(() => loader.loadNamedTable('Table1')).toThrow(
      'Workbook not loaded',
    );
  });

  test('loadNamedTable throws on missing sheet reference', async () => {
    const loader = new ExcelLoader();
    await loader.loadWorkbook(file);
    const wb = (loader as unknown as { workbook: XLSX.WorkBook }).workbook!;
    wb.Workbook = { Names: [{ Name: 'Bad', Ref: 'Missing!A1:B1' }] };
    expect(() => loader.loadNamedTable('Bad')).toThrow(
      'Missing sheet for table: Bad',
    );
  });
});
