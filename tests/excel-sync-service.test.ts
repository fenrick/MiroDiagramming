import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ExcelSyncService } from '../src/core/excel-sync-service';
import { templateManager } from '../src/board/templates';
import { BoardBuilder } from '../src/board/board-builder';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('ExcelSyncService', () => {
  beforeEach(() => {
    global.miro = { board: { get: vi.fn().mockResolvedValue([]) } };
  });

  test('registerMapping and getWidgetId round trip', () => {
    const service = new ExcelSyncService();
    service.registerMapping('1', 'w1');
    expect(service.getWidgetId('1')).toBe('w1');
  });

  test('updateShapesFromExcel applies template to matching widget', async () => {
    const shape = {
      type: 'shape',
      id: 's1',
      shape: 'rectangle',
      content: '',
      style: {},
      getMetadata: vi.fn().mockResolvedValue({ rowId: '1' }),
      setMetadata: vi.fn().mockResolvedValue(undefined),
    } as unknown as Record<string, unknown>;
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([shape]);
    vi.spyOn(templateManager, 'getTemplate').mockReturnValue({
      elements: [{ text: '{{label}}' }],
    } as never);
    const service = new ExcelSyncService(new BoardBuilder());
    await service.updateShapesFromExcel(
      [{ ID: '1', Name: 'A', Type: 'Role', Notes: 'meta' }],
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
    const shape = {
      type: 'shape',
      id: 's1',
      content: 'X',
      getMetadata: vi.fn().mockResolvedValue({ rowId: '1', notes: 'meta' }),
      setMetadata: vi.fn().mockResolvedValue(undefined),
    } as unknown as Record<string, unknown>;
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([shape]);
    const service = new ExcelSyncService(new BoardBuilder());
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
    const shape = {
      type: 'shape',
      id: 's1',
      content: 'X',
      getMetadata: vi
        .fn()
        .mockResolvedValue({ rowId: '1', notes: 'meta', text: 'desc' }),
    } as unknown as Record<string, unknown>;
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([shape]);
    const service = new ExcelSyncService(new BoardBuilder());
    const rows = await service.pushChangesToExcel([{ ID: '1', Name: '' }], {
      idColumn: 'ID',
      labelColumn: 'Name',
      textColumn: 'Desc',
      metadataColumns: { notes: 'Notes' },
    });
    expect(rows[0].Desc).toBe('desc');
  });

  test('findWidget locates groups by metadata', async () => {
    const shape = {
      type: 'shape',
      id: 's1',
      content: 'Y',
      getMetadata: vi.fn().mockResolvedValue({ rowId: '1' }),
    } as Record<string, unknown>;
    const group = {
      type: 'group',
      id: 'g1',
      getItems: vi.fn().mockResolvedValue([shape]),
    } as Record<string, unknown>;
    (global.miro!.board!.get as vi.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([group]);
    const service = new ExcelSyncService(new BoardBuilder());
    const rows = await service.pushChangesToExcel([{ ID: '1', Name: '' }], {
      idColumn: 'ID',
      labelColumn: 'Name',
    });
    expect(rows[0].Name).toBe('Y');
    expect(service.getWidgetId('1')).toBe('g1');
  });
});

describe('ExcelSyncService additional cases', () => {
  test('updateShapesFromExcel skips missing widgets', async () => {
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([]);
    const service = new ExcelSyncService(new BoardBuilder());
    await service.updateShapesFromExcel([{ ID: '1', Name: 'A' }], {
      idColumn: 'ID',
      labelColumn: 'Name',
    });
    expect(service.getWidgetId('1')).toBeUndefined();
  });

  test('pushChangesToExcel leaves rows when widget absent', async () => {
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([]);
    const service = new ExcelSyncService(new BoardBuilder());
    const rows = await service.pushChangesToExcel([{ ID: '1', Name: '' }], {
      idColumn: 'ID',
      labelColumn: 'Name',
    });
    expect(rows[0].Name).toBe('');
  });

  test('updateShapesFromExcel returns early without template', async () => {
    const shape = {
      type: 'shape',
      id: 's1',
      getMetadata: vi.fn().mockResolvedValue({ rowId: '1' }),
      setMetadata: vi.fn().mockResolvedValue(undefined),
    } as unknown as Record<string, unknown>;
    (global.miro!.board!.get as vi.Mock).mockResolvedValueOnce([shape]);
    vi.spyOn(templateManager, 'getTemplate').mockReturnValue(
      undefined as never,
    );
    const service = new ExcelSyncService(new BoardBuilder());
    await service.updateShapesFromExcel(
      [{ ID: '1', Name: 'A', Type: 'Role' }],
      { idColumn: 'ID', labelColumn: 'Name', templateColumn: 'Type' },
    );
    expect(shape.setMetadata).not.toHaveBeenCalled();
  });
});
