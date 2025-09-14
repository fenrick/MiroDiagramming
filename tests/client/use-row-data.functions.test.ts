/** @vitest-environment jsdom */
import type { BaseItem, Group } from '@mirohq/websdk-types'

import { extractRowId, findRow } from '../src/ui/hooks/use-row-data'
import type { ExcelRow } from '../src/core/utils/excel-loader'

describe('use-row-data helpers', () => {
  test('extractRowId returns first child value for groups', async () => {
    const widget = {
      type: 'group',
      getItems: vi.fn().mockResolvedValue([{ content: '1' }, { content: '2' }]),
    }
    await expect(extractRowId(widget as unknown as BaseItem | Group)).resolves.toBe('1')
  })

  test('extractRowId handles single widget', async () => {
    const widget = { type: 'shape', content: ' 42 ' }
    await expect(extractRowId(widget as unknown as BaseItem | Group)).resolves.toBe('42')
  })

  test('findRow locates row by id column', () => {
    const rows = [
      { ID: '1', Name: 'A' },
      { ID: '2', Name: 'B' },
    ] as unknown as ExcelRow[]
    expect(findRow(rows, 'ID', '2')).toEqual(rows[1])
  })

  test('findRow falls back to index lookup', () => {
    const rows = [{ Name: 'A' }, { Name: 'B' }] as unknown as ExcelRow[]
    expect(findRow(rows, undefined, '1')).toEqual(rows[1])
    expect(findRow(rows, undefined, '5')).toBeNull()
  })
})
