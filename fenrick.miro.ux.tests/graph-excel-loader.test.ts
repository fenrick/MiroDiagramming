import { GraphExcelLoader } from 'fenrick.miro.ux/core/utils/excel-loader';
import { GraphClient } from 'fenrick.miro.ux/core/utils/graph-client';
import ExcelJS from 'exceljs';

vi.mock('fenrick.miro.ux/core/utils/graph-client');

let buf: ArrayBuffer;
beforeAll(async () => {
  const wb = new ExcelJS.Workbook();
  wb.addWorksheet('Sheet1').addRow([1]);
  buf = await wb.xlsx.writeBuffer();
});

describe('GraphExcelLoader', () => {
  test('loads workbook via client', async () => {
    const client = new GraphClient();
    (client.fetchFile as unknown as vi.Mock).mockResolvedValue(buf);
    const loader = new GraphExcelLoader(client);
    await loader.loadWorkbookFromGraph('id');
    expect(loader.listSheets()).toEqual(['Sheet1']);
    expect(client.fetchFile).toHaveBeenCalledWith('id');
  });
});
