import ExcelJS from 'exceljs'
import { loadExcelJS } from '../src/core/utils/exceljs-loader'

describe('loadExcelJS', () => {
  test('loads ExcelJS from node_modules in Node', async () => {
    const mod = await loadExcelJS()
    expect(mod).toBe(ExcelJS)
  })

  test('caches subsequent calls', async () => {
    const first = await loadExcelJS()
    const second = await loadExcelJS()
    expect(first).toBe(second)
  })
})
