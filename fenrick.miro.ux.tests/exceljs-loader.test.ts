import { loadExcelJS } from '../fenrick.miro.ux/src/core/utils/exceljs-loader';
import ExcelJS from 'exceljs';

describe('loadExcelJS', () => {
  test('loads ExcelJS from node_modules in Node', async () => {
    const mod = await loadExcelJS();
    expect(mod).toBe(ExcelJS);
  });

  test('caches subsequent calls', async () => {
    const first = await loadExcelJS();
    const second = await loadExcelJS();
    expect(first).toBe(second);
  });
});
