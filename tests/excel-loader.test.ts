/** @vitest-environment jsdom */
import * as XLSX from 'xlsx';
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

describe('excel loader', () => {
  let file: File;

  beforeAll(() => {
    file = createFile();
  });

  test('loads workbook and lists sheets', async () => {
    const loader = new ExcelLoader();
    await loader.loadWorkbook(file);
    expect(loader.listSheets()).toEqual(['Sheet1', 'Sheet2']);
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
});
