import React from 'react';
import { useDropzone } from 'react-dropzone';
import { ColumnMapping, mapRowsToNodes } from '../../core/data-mapper';
import { GraphProcessor } from '../../core/graph/graph-processor';
import {
  excelLoader,
  ExcelRow,
  graphExcelLoader,
} from '../../core/utils/excel-loader';
import { addMiroIds, downloadWorkbook } from '../../core/utils/workbook-writer';
import { showError } from './notifications';
import { getDropzoneStyle } from './ui-utils';

export interface DropReturn {
  dropzone: ReturnType<typeof useDropzone>;
  style: React.CSSProperties;
}

/**
 * Handle drag-and-drop of Excel files with visual feedback.
 *
 * @param onDrop - Callback invoked when a valid file is dropped.
 * @returns Dropzone bindings and computed style.
 */
export function useExcelDrop(
  onDrop: (files: File[]) => Promise<void>,
): DropReturn {
  const dropzone = useDropzone({
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    maxFiles: 1,
    onDrop: (files: File[]) => void onDrop(files),
  });

  const style = React.useMemo(() => {
    let state: Parameters<typeof getDropzoneStyle>[0] = 'base';
    if (dropzone.isDragReject) {
      state = 'reject';
    } else if (dropzone.isDragAccept) {
      state = 'accept';
    }
    return getDropzoneStyle(state);
  }, [dropzone.isDragAccept, dropzone.isDragReject]);

  return { dropzone, style };
}

interface CreateArgs {
  rows: ExcelRow[];
  selected: Set<number>;
  template: string;
  templateColumn: string;
  idColumn: string;
  labelColumn: string;
  file: File | null;
  setRows: React.Dispatch<React.SetStateAction<ExcelRow[]>>;
}

/**
 * Convert selected worksheet rows into Miro nodes.
 *
 * @param rows - Table rows currently loaded in the UI.
 * @param selected - Row indices chosen for import.
 * @param template - Fallback template when no column is specified.
 * @param templateColumn - Optional column specifying widget templates.
 * @param idColumn - Column containing persistent IDs.
 * @param labelColumn - Column providing widget labels.
 * @param file - Original workbook for optional download.
 * @param setRows - Setter updating UI state with added IDs.
 */
export function useExcelCreate({
  rows,
  selected,
  template,
  templateColumn,
  idColumn,
  labelColumn,
  file,
  setRows,
}: CreateArgs): () => Promise<void> {
  const graphProcessor = React.useMemo(() => new GraphProcessor(), []);
  return React.useCallback(async () => {
    try {
      const mapping: ColumnMapping = {
        idColumn: idColumn || undefined,
        labelColumn: labelColumn || undefined,
        templateColumn: templateColumn || undefined,
      };
      const indices = [...selected];
      const chosen = rows.filter((_, i) => selected.has(i));
      const nodes = mapRowsToNodes(chosen, mapping).map(n => ({
        ...n,
        type: templateColumn ? n.type : template,
      }));
      await graphProcessor.processGraph({ nodes, edges: [] });
      const idMap = graphProcessor.getNodeIdMap();
      const updated = addMiroIds(chosen, mapping.idColumn ?? '', idMap);
      const merged = rows.map((r, i) => {
        const idx = indices.indexOf(i);
        return idx >= 0 ? updated[idx] : r;
      });
      setRows(merged);
      /* istanbul ignore next */
      if (file) {
        await downloadWorkbook(merged, `updated-${file.name}`);
      }
    } catch (e) {
      await showError(String(e));
    }
  }, [
    file,
    graphProcessor,
    idColumn,
    labelColumn,
    rows,
    selected,
    setRows,
    template,
    templateColumn,
  ]);
}

/**
 * Load a workbook dropped from local disk.
 *
 * @param files - Dropped file list from the browser.
 */
export async function handleLocalDrop(files: File[]): Promise<void> {
  await excelLoader.loadWorkbook(files[0]);
}

/**
 * Fetch an Excel workbook referenced by a graph file.
 *
 * @param url - URL pointing to the hosted graph JSON.
 */
export async function fetchRemoteWorkbook(url: string): Promise<void> {
  await graphExcelLoader.loadWorkbookFromGraph(url);
}
