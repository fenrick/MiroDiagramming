import { ExcelSyncService } from '../src/core/excel-sync-service';
import type { ExcelRow } from '../src/core/utils/excel-loader';
import type { ColumnMapping } from '../src/core/data-mapper';

describe('ExcelSyncService', () => {
  test('registerMapping and getWidgetId round-trip', () => {
    const svc = new ExcelSyncService();
    svc.registerMapping('r1', 'w1');
    expect(svc.getWidgetId('r1')).toBe('w1');
  });

  test('updateRowFromWidget writes label when provided', () => {
    const svc = new ExcelSyncService() as unknown as {
      updateRowFromWidget: (
        row: ExcelRow,
        map: ColumnMapping,
        data: { content?: string },
      ) => ExcelRow;
    };
    const row = { ID: '1', Name: 'Old' } as ExcelRow;
    const mapping = { idColumn: 'ID', labelColumn: 'Name' } as ColumnMapping;
    const updated = svc.updateRowFromWidget(row, mapping, { content: 'New' });
    expect(updated.Name).toBe('New');
  });

  test('updateRowFromWidget keeps label when content missing', () => {
    const svc = new ExcelSyncService() as unknown as {
      updateRowFromWidget: (
        row: ExcelRow,
        map: ColumnMapping,
        data: { content?: string },
      ) => ExcelRow;
    };
    const row = { ID: '1', Name: 'Old' } as ExcelRow;
    const mapping = { idColumn: 'ID', labelColumn: 'Name' } as ColumnMapping;
    const updated = svc.updateRowFromWidget(row, mapping, {});
    expect(updated.Name).toBe('Old');
  });

  test('extractItem returns first group item', async () => {
    const svc = new ExcelSyncService() as unknown as {
      extractItem: (w: {
        type: string;
        getItems?: () => Promise<unknown[]>;
      }) => Promise<unknown>;
    };
    const widget = {
      type: 'group',
      getItems: vi.fn().mockResolvedValue(['a', 'b']),
    };
    await expect(svc.extractItem(widget)).resolves.toBe('a');
  });

  test('extractItem returns widget for non group', async () => {
    const svc = new ExcelSyncService() as unknown as {
      extractItem: (w: { type: string }) => Promise<unknown>;
    };
    const widget = { type: 'shape' };
    await expect(svc.extractItem(widget)).resolves.toBe(widget);
  });
});
