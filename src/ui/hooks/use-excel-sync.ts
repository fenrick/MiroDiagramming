import React from 'react'

import { ExcelSyncService } from '../../core/excel-sync-service'
import { useOptimisticOps } from '../../core/hooks/useOptimisticOps'
import type { ExcelRow } from '../../core/utils/excel-loader'

import { useExcelData } from './excel-data-context'

/**
 * Hook returning a function that updates local row data and board widgets.
 */
function replaceRowAt(rows: ExcelRow[], index: number, row: ExcelRow): ExcelRow[] {
  const next = rows.slice()
  next[index] = row
  return next
}

function makeApply(
  setRows: React.Dispatch<React.SetStateAction<ExcelRow[]>>,
  index: number,
  updated: ExcelRow,
): () => void {
  return () => setRows((prev) => replaceRowAt(prev, index, updated))
}

function makeRollback(
  setRows: React.Dispatch<React.SetStateAction<ExcelRow[]>>,
  index: number,
  prev: ExcelRow,
): () => void {
  return () => setRows((prevRows) => replaceRowAt(prevRows, index, prev))
}

function makeCommit(
  serviceRef: React.MutableRefObject<ExcelSyncService>,
  updated: ExcelRow,
  opts: { idColumn?: string; labelColumn?: string; templateColumn?: string },
): () => Promise<void> {
  return () => serviceRef.current.updateShapesFromExcel([updated], opts)
}

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
      const apply = makeApply(ctx.setRows, index, updated)
      const rollback = makeRollback(ctx.setRows, index, prev)
      const commit = makeCommit(serviceRef, updated, {
        idColumn: ctx.idColumn,
        labelColumn: ctx.labelColumn,
        templateColumn: ctx.templateColumn,
      })

      await enqueue({ apply, rollback, commit })
    },
    [ctx, enqueue],
  )
}
