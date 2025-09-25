import type { ColumnMapping } from '../../core/data-mapper'
import type { ExcelRow } from '../../core/utils/excel-loader'
import type { ExcelSyncService } from '../../core/excel-sync-service'

/**
 * Minimal surface of {@link ExcelSyncService} used for applying Excel changes.
 */
export type ExcelApplyService = Pick<ExcelSyncService, 'updateShapesFromExcel'>

/**
 * Apply workbook rows to board widgets using the provided service.
 *
 * @param service - Service responsible for updating board shapes.
 * @param rows - Workbook rows currently loaded in the UI.
 * @param selected - Indices of rows selected by the user.
 * @param mapping - Column mapping describing identifiers, labels and templates.
 */
export async function applyExcelChanges(
  service: ExcelApplyService | null | undefined,
  rows: ExcelRow[],
  selected: Set<number>,
  mapping: ColumnMapping,
): Promise<void> {
  if (!service) {
    throw new Error('Excel apply service unavailable.')
  }
  const indices = [...selected]
  if (indices.length === 0) {
    throw new Error('Select at least one row to apply changes.')
  }
  const chosen = indices
    .filter((index) => index >= 0 && index < rows.length)
    .map((index) => rows[index]!)
  if (!chosen.length) {
    throw new Error('Select at least one row to apply changes.')
  }
  await service.updateShapesFromExcel(chosen, mapping)
}
