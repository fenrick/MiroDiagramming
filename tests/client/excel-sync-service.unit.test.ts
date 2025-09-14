import type { Group } from '@mirohq/websdk-types'

import type { ColumnMapping } from '../src/core/data-mapper'
import type { ExcelRow } from '../src/core/utils/excel-loader'
import { ExcelSyncService } from '../src/core/excel-sync-service'
import { searchShapes, searchGroups } from '../src/board/node-search'
import { templateManager } from '../src/board/templates'
import { applyElementToItem } from '../src/board/element-utils'
import { ShapeClient } from '../src/core/utils/shape-client'

import { mockBoard } from './mock-board'

vi.mock('../src/board/node-search', () => ({
  searchShapes: vi.fn(),
  searchGroups: vi.fn(),
}))
vi.mock('../src/board/templates', () => ({
  templateManager: { getTemplate: vi.fn() },
}))
vi.mock('../src/board/element-utils', () => ({ applyElementToItem: vi.fn() }))

describe('ExcelSyncService', () => {
  beforeEach(() => vi.clearAllMocks())
  test('registerMapping and getWidgetId round-trip', () => {
    const svc = new ExcelSyncService()
    svc.registerMapping('r1', 'w1')
    expect(svc.getWidgetId('r1')).toBe('w1')
  })

  test('updateRowFromWidget writes label when provided', () => {
    const svc = new ExcelSyncService() as unknown as {
      updateRowFromWidget: (
        row: ExcelRow,
        map: ColumnMapping,
        data: { content?: string },
      ) => ExcelRow
    }
    const row = { ID: '1', Name: 'Old' } as ExcelRow
    const mapping = { idColumn: 'ID', labelColumn: 'Name' } as ColumnMapping
    const updated = svc.updateRowFromWidget(row, mapping, { content: 'New' })
    expect(updated.Name).toBe('New')
  })

  test('updateRowFromWidget keeps label when content missing', () => {
    const svc = new ExcelSyncService() as unknown as {
      updateRowFromWidget: (
        row: ExcelRow,
        map: ColumnMapping,
        data: { content?: string },
      ) => ExcelRow
    }
    const row = { ID: '1', Name: 'Old' } as ExcelRow
    const mapping = { idColumn: 'ID', labelColumn: 'Name' } as ColumnMapping
    const updated = svc.updateRowFromWidget(row, mapping, {})
    expect(updated.Name).toBe('Old')
  })

  test('extractItem returns first group item', async () => {
    const svc = new ExcelSyncService() as unknown as {
      extractItem: (w: { type: string; getItems?: () => Promise<unknown[]> }) => Promise<unknown>
    }
    const widget = {
      type: 'group',
      getItems: vi.fn().mockResolvedValue(['a', 'b']),
    }
    await expect(svc.extractItem(widget)).resolves.toBe('a')
  })

  test('extractItem returns widget for non group', async () => {
    const svc = new ExcelSyncService() as unknown as {
      extractItem: (w: { type: string }) => Promise<unknown>
    }
    const widget = { type: 'shape' }
    await expect(svc.extractItem(widget)).resolves.toBe(widget)
  })

  test('findWidget uses cached id mapping', async () => {
    mockBoard()
    const api = {
      getShape: vi.fn().mockResolvedValue({ id: 'w1' }),
    } as unknown as ShapeClient
    const svc = new ExcelSyncService(api) as unknown as {
      findWidget: (id: string, label: string) => Promise<{ id: string } | undefined>
    }
    ;(svc as unknown as ExcelSyncService).registerMapping('r1', 'w1')
    const result = await svc.findWidget('r1', 'foo')
    expect(result).toEqual({ id: 'w1' })
    expect(api.getShape).toHaveBeenCalledWith('w1')
    expect(searchShapes).not.toHaveBeenCalled()
    expect(searchGroups).not.toHaveBeenCalled()
  })

  test('findWidget searches shapes then groups', async () => {
    const api = {
      getShape: vi.fn().mockRejectedValue(new Error('nope')),
    } as unknown as ShapeClient
    mockBoard()
    ;(searchShapes as vi.Mock).mockResolvedValueOnce(undefined)
    ;(searchGroups as vi.Mock).mockResolvedValueOnce({ id: 'g1' })
    const svc = new ExcelSyncService(api) as unknown as {
      findWidget: (id: string, label: string) => Promise<{ id: string } | undefined>
    }
    const result = await svc.findWidget('x', 'lab')
    expect(searchShapes).toHaveBeenCalled()
    expect(searchGroups).toHaveBeenCalled()
    expect(result).toEqual({ id: 'g1' })
  })

  test('pushChangesToExcel merges widget data', async () => {
    const svc = new ExcelSyncService() as unknown as {
      pushChangesToExcel: (rows: ExcelRow[], map: ColumnMapping) => Promise<ExcelRow[]>
    }
    ;(svc as unknown as { lookupWidget: vi.Mock }).lookupWidget = vi
      .fn()
      .mockResolvedValueOnce({ id: 'w0', content: 'Z' })
      .mockResolvedValueOnce(undefined)
    ;(svc as unknown as { extractWidgetData: vi.Mock }).extractWidgetData = vi.fn(async (w) => ({
      content: (w as { content?: string }).content,
    }))
    const rows = [
      { ID: '0', Name: 'A' },
      { ID: '1', Name: 'B' },
    ] as unknown as ExcelRow[]
    const mapping = { idColumn: 'ID', labelColumn: 'Name' } as ColumnMapping
    const result = await svc.pushChangesToExcel(rows, mapping)
    expect(result[0].Name).toBe('Z')
    expect(result[1].Name).toBe('B')
    expect((svc as unknown as ExcelSyncService).getWidgetId('0')).toBe('w0')
  })

  test('applyTemplate updates group content', async () => {
    ;(templateManager.getTemplate as vi.Mock).mockReturnValue({
      elements: [{}, {}],
      masterElement: 1,
    })
    const items = [{ type: 'shape' }, { type: 'shape', content: '' }]
    const group = {
      type: 'group',
      getItems: vi.fn().mockResolvedValue(items),
    } as unknown as Group
    const svc = new ExcelSyncService() as unknown as {
      applyTemplate: (w: Group, label: string, tpl: string) => Promise<void>
    }
    await svc.applyTemplate(group, 'L', 'T')
    expect(applyElementToItem).toHaveBeenCalledTimes(2)
    expect(items[1].content).toBe('L')
  })
})
