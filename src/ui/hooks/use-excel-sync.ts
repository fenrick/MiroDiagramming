import React from 'react'

import { ExcelSyncService } from '../../core/excel-sync-service'
import { useOptimisticOps } from '../../core/hooks/useOptimisticOps'
import type { ExcelRow } from '../../core/utils/excel-loader'

import { useExcelData } from './excel-data-context'

/**
 * Hook returning a function that updates local row data and board widgets.
 */
export function useExcelSync(): (index: number, row: ExcelRow) => Promise<void> {
  const ctx = useExcelData()
  const serviceRef = React.useRef<ExcelSyncService>(new ExcelSyncService())
  const enqueue = useOptimisticOps()

  return React.useCallback(
    async (index: number, updated: ExcelRow): Promise<void> => {
      if (!ctx) {
        return
      }
      const prev = ctx.rows[index]!

      const apply = () =>
        ctx.setRows((prevRows) => prevRows.map((r, i) => (i === index ? updated : r)))

      const rollback = () =>
        ctx.setRows((prevRows) => prevRows.map((r, i) => (i === index ? prev : r)))

      const commit = () =>
        serviceRef.current.updateShapesFromExcel([updated], {
          idColumn: ctx.idColumn,
          labelColumn: ctx.labelColumn,
          templateColumn: ctx.templateColumn,
        })

      await enqueue({ apply, rollback, commit })
    },
    [ctx, enqueue],
  )
}
