import { GraphExcelLoader } from '../src/core/utils/excel-loader';
import { GraphClient } from '../src/core/utils/graph-client';
import * as XLSX from 'xlsx';

vi.mock('../src/core/utils/graph-client');

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[1]]), 'Sheet1');
const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

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
