import * as XLSX from 'xlsx';
import type { ExcelRow } from './excel-loader';

/**
 * Add Miro widget identifiers to the provided rows using the given ID column.
 *
 * @param rows - Original Excel rows.
 * @param idColumn - Column containing the row identifier.
 * @param idMap - Mapping from row ID to Miro widget ID.
 * @returns Updated rows with a `MiroId` column when a match is found.
 */
export function addMiroIds(
  rows: ExcelRow[],
  idColumn: string,
  idMap: Record<string, string>,
): ExcelRow[] {
  return rows.map((row, index) => {
    const key = row[idColumn] != null ? String(row[idColumn]) : String(index);
    const miroId = idMap[key];
    return miroId ? { ...row, MiroId: miroId } : { ...row };
  });
}

/**
 * Download the provided rows as an Excel workbook with a single sheet.
 *
 * @param rows - Rows to write into the workbook.
 * @param fileName - Suggested download file name.
 */
export function downloadWorkbook(rows: ExcelRow[], fileName: string): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const data = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
