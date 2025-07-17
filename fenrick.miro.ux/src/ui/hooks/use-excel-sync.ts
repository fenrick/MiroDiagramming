import React from 'react';
import { ExcelSyncService } from '../../core/excel-sync-service';
import type { ExcelRow } from '../../core/utils/excel-loader';
import { useExcelData } from './excel-data-context';

/**
 * Hook returning a function that updates local row data and board widgets.
 */
export function useExcelSync(): (
  index: number,
  row: ExcelRow,
) => Promise<void> {
  const ctx = useExcelData();
  const serviceRef = React.useRef<ExcelSyncService>(new ExcelSyncService());
  return React.useCallback(
    async (index: number, updated: ExcelRow): Promise<void> => {
      if (!ctx) return;
      ctx.setRows((prev) => prev.map((r, i) => (i === index ? updated : r)));
      await serviceRef.current.updateShapesFromExcel([updated], {
        idColumn: ctx.idColumn,
        labelColumn: ctx.labelColumn,
        templateColumn: ctx.templateColumn,
      });
    },
    [ctx],
  );
}
