/** @vitest-environment jsdom */
import ExcelJS from 'exceljs';
import { readFileSync } from 'fs';
import { ExcelLoader } from '../fenrick.miro.ux/src/core/utils/excel-loader';

async function createFile(): Promise<File> {
  const wb = new ExcelJS.Workbook();
  const ws1 = wb.addWorksheet('Sheet1');
  ws1.addRow(['A', 'B']);
  ws1.addRow([1, 2]);
  ws1.addRow([3, 4]);

  const ws2 = wb.addWorksheet('Sheet2');
  ws2.addRow(['X', 'Y']);
  ws2.addRow([5, 6]);

  wb.definedNames.add('Sheet2!A1:B2', 'Table1');

  const buf = await wb.xlsx.writeBuffer();
  return {
    name: 'test.xlsx',
    async arrayBuffer() {
      return buf;
    },
  } as unknown as File;
}

function readFixtureFile(): File {
  const buf = readFileSync('fenrick.miro.ux.tests/fixtures/sample.xlsx');
  return {
    name: 'sample.xlsx',
    async arrayBuffer() {
      return buf;
    },
  } as unknown as File;
}

describe('excel loader', () => {
  let file: File;

  beforeAll(async () => {
    file = await createFile();
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
    const rows = loader.loadSheet('Sheet1');
    expect(rows.length).toBeGreaterThan(0);
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
    const wb = (loader as unknown as { workbook: ExcelJS.Workbook }).workbook!;
    wb.definedNames.add('Missing!A1:B1', 'Bad');
    expect(() => loader.loadNamedTable('Bad')).toThrow(
      'Missing sheet for table: Bad',
    );
  });

  test('parseRange rejects malformed references', async () => {
    const loader = new ExcelLoader();
    await loader.loadWorkbook(file);
    const helper = loader as unknown as {
      getSheet: (name: string) => ExcelJS.Worksheet;
      parseRange: (ref: string, ws: ExcelJS.Worksheet) => unknown;
    };
    const ws = helper.getSheet('Sheet1');
    expect(() => helper.parseRange('A1B2', ws)).toThrow('Invalid range: A1B2');
  });
});
