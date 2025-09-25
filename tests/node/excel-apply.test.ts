import { describe, it, expect, vi } from 'vitest'

import type { ColumnMapping } from '../../src/core/data-mapper'
import type { ExcelRow } from '../../src/core/utils/excel-loader'
import { applyExcelChanges, ExcelApplyService } from '../../src/ui/pages/excel-apply'

describe('applyExcelChanges', () => {
  const mapping: ColumnMapping = { idColumn: 'id', labelColumn: 'name', templateColumn: 'tpl' }
  const rows: ExcelRow[] = [
    { id: '1', name: 'Alpha', tpl: 'default' },
    { id: '2', name: 'Beta', tpl: 'custom' },
  ]

  it('throws when no rows are selected', async () => {
    await expect(
      applyExcelChanges({ updateShapesFromExcel: vi.fn() }, rows, new Set(), mapping),
    ).rejects.toThrow('Select at least one row to apply changes.')
  })

  it('invokes the service with selected rows', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    const service: ExcelApplyService = { updateShapesFromExcel: update }
    const selected = new Set([1])

    await applyExcelChanges(service, rows, selected, mapping)

    expect(update).toHaveBeenCalledWith([rows[1]], mapping)
  })

  it('filters out-of-range selections', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    const service: ExcelApplyService = { updateShapesFromExcel: update }
    const selected = new Set([5])

    await expect(applyExcelChanges(service, rows, selected, mapping)).rejects.toThrow(
      'Select at least one row to apply changes.',
    )
    expect(update).not.toHaveBeenCalled()
  })
  it('throws when service is unavailable', async () => {
    await expect(applyExcelChanges(null, rows, new Set([0]), mapping)).rejects.toThrow(
      'Excel apply service unavailable.',
    )
  })
})
