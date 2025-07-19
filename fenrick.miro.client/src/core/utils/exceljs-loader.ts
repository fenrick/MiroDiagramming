import type ExcelJS from 'exceljs';

/**
 * Dynamically load the ExcelJS library.
 *
 * The module is fetched from node_modules when running in Node (tests)
 * and from jsDelivr CDN when executed in the browser to avoid bundling it.
 */
let excelPromise: Promise<typeof ExcelJS> | null = null;

/** Retrieve the ExcelJS constructor. Cached after the first call. */
export async function loadExcelJS(): Promise<typeof ExcelJS> {
  if (excelPromise) return excelPromise;

  const isNode =
    typeof process !== 'undefined' && process.release?.name === 'node';
  const dynamic = (p: string) => import(/* @vite-ignore */ p);

  excelPromise = isNode
    ? dynamic('exceljs').then((m) => (m.default ?? m) as typeof ExcelJS)
    : dynamic('https://cdn.jsdelivr.net/npm/exceljs@4.4.0/+esm').then(
        (m) => (m.default ?? m) as typeof ExcelJS,
      );

  return excelPromise;
}
