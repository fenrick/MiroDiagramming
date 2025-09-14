/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react'
import { useDropzone } from 'react-dropzone'

import { excelLoader, graphExcelLoader } from '../src/core/utils/excel-loader'
import {
  fetchRemoteWorkbook,
  handleLocalDrop,
  useExcelDrop,
} from '../src/ui/hooks/use-excel-handlers'
import { getDropzoneStyle } from '../src/ui/hooks/ui-utils'

vi.mock('../src/core/utils/excel-loader', () => ({
  excelLoader: { loadWorkbook: vi.fn() },
  graphExcelLoader: { loadWorkbookFromGraph: vi.fn() },
}))

let dropCallback: (files: File[]) => Promise<void>
vi.mock('react-dropzone', () => ({
  useDropzone: (opts: { onDrop: (files: File[]) => Promise<void> }) => {
    dropCallback = opts.onDrop
    return { isDragAccept: false, isDragReject: false } as ReturnType<typeof useDropzone>
  },
}))

vi.mock('../src/ui/hooks/ui-utils', () => ({
  getDropzoneStyle: vi.fn(() => ({ style: true })),
}))

describe('use-excel-handlers helpers', () => {
  test('handleLocalDrop delegates to excel loader', async () => {
    const f = new File(['a'], 'a.xlsx')
    await handleLocalDrop([f])
    expect(excelLoader.loadWorkbook).toHaveBeenCalledWith(f)
  })

  test('fetchRemoteWorkbook delegates to graph loader', async () => {
    await fetchRemoteWorkbook('url')
    expect(graphExcelLoader.loadWorkbookFromGraph).toHaveBeenCalledWith('url')
  })

  test('useExcelDrop forwards drop callback', async () => {
    const cb = vi.fn().mockResolvedValue(undefined)
    renderHook(() => useExcelDrop(cb))
    const f = new File(['b'], 'b.xlsx')
    await act(async () => {
      await dropCallback([f])
    })
    expect(cb).toHaveBeenCalledWith([f])
    expect(getDropzoneStyle).toHaveBeenCalled()
  })
})

import { useExcelCreate } from '../src/ui/hooks/use-excel-handlers'
import { addMiroIds } from '../src/core/utils/workbook-writer'
import { mapRowsToNodes } from '../src/core/data-mapper'
import { GraphProcessor } from '../src/core/graph/graph-processor'
import { showError } from '../src/ui/hooks/notifications'

vi.mock('../src/core/utils/workbook-writer', () => ({
  addMiroIds: vi.fn((rows, col, map) => rows.map((r) => ({ ...r, [col]: map.n1 }))),
  downloadWorkbook: vi.fn(),
}))
vi.mock('../src/core/data-mapper', () => ({
  mapRowsToNodes: vi.fn(() => [
    { id: 'n1', label: 'A', type: 'Motivation', metadata: { rowId: '1' } },
  ]),
  ColumnMapping: class {},
}))
vi.mock('../src/ui/hooks/notifications', () => ({ showError: vi.fn() }))
vi.mock('../src/core/graph/graph-processor')

describe('use-excel-create', () => {
  test('creates nodes and updates rows', async () => {
    const processSpy = vi
      .spyOn(GraphProcessor.prototype, 'processGraph')
      .mockResolvedValue(undefined)
    vi.spyOn(GraphProcessor.prototype, 'getNodeIdMap').mockReturnValue({
      n1: 'w1',
    })
    const setRows = vi.fn()
    const { result } = renderHook(() =>
      useExcelCreate({
        rows: [{ ID: '1', Name: 'A' }],
        selected: new Set([0]),
        template: 'Motivation',
        templateColumn: '',
        idColumn: 'ID',
        labelColumn: 'Name',
        file: null,
        setRows,
      }),
    )
    await act(async () => {
      await result.current()
    })
    expect(processSpy).toHaveBeenCalled()
    expect(mapRowsToNodes).toHaveBeenCalled()
    expect(addMiroIds).toHaveBeenCalled()
    expect(setRows).toHaveBeenCalledWith([{ ID: 'w1', Name: 'A' }])
  })

  test('reports errors', async () => {
    vi.spyOn(GraphProcessor.prototype, 'processGraph').mockRejectedValue(new Error('fail'))
    const setRows = vi.fn()
    const { result } = renderHook(() =>
      useExcelCreate({
        rows: [],
        selected: new Set(),
        template: 't',
        templateColumn: '',
        idColumn: '',
        labelColumn: '',
        file: null,
        setRows,
      }),
    )
    await act(async () => {
      await result.current()
    })
    expect(showError).toHaveBeenCalled()
  })
})
