import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ExcelSyncService, ContentItem } from '../src/core/excel-sync-service';
import { templateManager } from '../src/board/templates';
import { mockBoard } from './mock-board';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

type MockContentItem = ContentItem & {
  getMetadata: vi.Mock;
  setMetadata?: vi.Mock;
  getItems?: vi.Mock;
  style?: Record<string, unknown>;
  shape?: string;
};

declare const global: GlobalWithMiro;

describe('ExcelSyncService', () => {
  beforeEach(() => {
    mockBoard({ get: vi.fn().mockResolvedValue([]) });
  });

  test('registerMapping and getWidgetId round trip', () => {
    const service = new ExcelSyncService();
    service.registerMapping('1', 'w1');
    expect(service.getWidgetId('1')).toBe('w1');
  });

  test('updateShapesFromExcel applies template to matching widget', async () => {
    const shape: MockContentItem = {
      type: 'shape',
      id: 's1',
      shape: 'rectangle',
      content: '',
      style: {},
      getMetadata: vi.fn().mockResolvedValue({ rowId: '1' }),
      setMetadata: vi.fn().mockResolvedValue(undefined),
    } as unknown as MockContentItem;
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([shape]);
    vi.spyOn(templateManager, 'getTemplate').mockReturnValue({
      elements: [{ text: '{{label}}' }],
    } as never);
    const service = new ExcelSyncService();
    await service.updateShapesFromExcel(
      [{ ID: '1', Name: 'A', Type: 'Motivation', Notes: 'meta' }],
      {
        idColumn: 'ID',
        labelColumn: 'Name',
        templateColumn: 'Type',
        metadataColumns: { notes: 'Notes' },
      },
    );
    expect(service.getWidgetId('1')).toBe('s1');
    expect(shape.setMetadata).toHaveBeenCalledWith(
      'app.miro.excel',
      expect.objectContaining({ rowId: '1', notes: 'meta' }),
    );
    expect(shape.content).toBe('A');
  });

  test('pushChangesToExcel writes widget text into rows', async () => {
    const shape: MockContentItem = {
      type: 'shape',
      id: 's1',
      content: 'X',
      getMetadata: vi.fn().mockResolvedValue({ rowId: '1', notes: 'meta' }),
      setMetadata: vi.fn().mockResolvedValue(undefined),
    } as unknown as MockContentItem;
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([shape]);
    const service = new ExcelSyncService();
    const rows = await service.pushChangesToExcel([{ ID: '1', Name: '' }], {
      idColumn: 'ID',
      labelColumn: 'Name',
      metadataColumns: { notes: 'Notes' },
    });
    expect(rows[0].Name).toBe('X');
    expect(rows[0].Notes).toBe('meta');
  });

  test('reset clears all mappings', () => {
    const service = new ExcelSyncService();
    service.registerMapping('1', 'w1');
    service.reset();
    expect(service.getWidgetId('1')).toBeUndefined();
  });

  test('pushChangesToExcel reads text column from metadata', async () => {
    const shape: MockContentItem = {
      type: 'shape',
      id: 's1',
      content: 'X',
      getMetadata: vi
        .fn()
        .mockResolvedValue({ rowId: '1', notes: 'meta', text: 'desc' }),
    } as unknown as MockContentItem;
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([shape]);
    const service = new ExcelSyncService();
    const rows = await service.pushChangesToExcel([{ ID: '1', Name: '' }], {
      idColumn: 'ID',
      labelColumn: 'Name',
      textColumn: 'Desc',
      metadataColumns: { notes: 'Notes' },
    });
    expect(rows[0].Desc).toBe('desc');
  });

  test('extractWidgetData returns widget values', async () => {
    const shape: MockContentItem = {
      type: 'shape',
      id: 's1',
      content: 'Z',
      getMetadata: vi.fn().mockResolvedValue({ rowId: '1', notes: 'meta' }),
    } as unknown as MockContentItem;
    const service = new ExcelSyncService();
    const data = await (service as never)['extractWidgetData'](shape);
    expect(data.content).toBe('Z');
    expect(data.meta).toEqual({ rowId: '1', notes: 'meta' });
  });

  test('updateRowFromWidget merges values', () => {
    const service = new ExcelSyncService();
    const result = (service as never)['updateRowFromWidget'](
      { ID: '1', Name: '' },
      {
        idColumn: 'ID',
        labelColumn: 'Name',
        metadataColumns: { notes: 'Notes' },
      },
      { content: 'A', meta: { notes: 'm' } },
    );
    expect(result.Name).toBe('A');
    expect(result.Notes).toBe('m');
  });

  test('findWidget locates groups by metadata', async () => {
    const shape: MockContentItem = {
      type: 'shape',
      id: 's1',
      content: 'Y',
      getMetadata: vi.fn().mockResolvedValue({ rowId: '1' }),
    } as unknown as MockContentItem;
    const group = {
      type: 'group',
      id: 'g1',
      getItems: vi.fn().mockResolvedValue([shape]),
    } as Record<string, unknown>;
    (global.miro!.board!.get as vi.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([group]);
    const service = new ExcelSyncService();
    const rows = await service.pushChangesToExcel([{ ID: '1', Name: '' }], {
      idColumn: 'ID',
      labelColumn: 'Name',
    });
    expect(rows[0].Name).toBe('Y');
    expect(service.getWidgetId('1')).toBe('g1');
  });
});

describe('ExcelSyncService additional cases', () => {
  beforeEach(() => {
    mockBoard({ get: vi.fn().mockResolvedValue([]) });
  });

  test('updateShapesFromExcel skips missing widgets', async () => {
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([]);
    const service = new ExcelSyncService();
    await service.updateShapesFromExcel([{ ID: '1', Name: 'A' }], {
      idColumn: 'ID',
      labelColumn: 'Name',
    });
    expect(service.getWidgetId('1')).toBeUndefined();
  });

  test('pushChangesToExcel leaves rows when widget absent', async () => {
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([]);
    const service = new ExcelSyncService();
    const rows = await service.pushChangesToExcel([{ ID: '1', Name: '' }], {
      idColumn: 'ID',
      labelColumn: 'Name',
    });
    expect(rows[0].Name).toBe('');
  });

  test('updateShapesFromExcel returns early without template', async () => {
    const shape: MockContentItem = {
      type: 'shape',
      id: 's1',
      getMetadata: vi.fn().mockResolvedValue({ rowId: '1' }),
      setMetadata: vi.fn().mockResolvedValue(undefined),
    } as unknown as MockContentItem;
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([shape]);
    vi.spyOn(templateManager, 'getTemplate').mockReturnValue(
      undefined as never,
    );
    const service = new ExcelSyncService();
    await service.updateShapesFromExcel(
      [{ ID: '1', Name: 'A', Type: 'Motivation' }],
      { idColumn: 'ID', labelColumn: 'Name', templateColumn: 'Type' },
    );
    expect(shape.setMetadata).not.toHaveBeenCalled();
  });
});
