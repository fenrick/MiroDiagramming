import React from 'react'

import type { ExcelRow } from '../../core/utils/excel-loader'

export interface ExcelDataContextValue {
  rows: ExcelRow[]
  idColumn?: string
  labelColumn?: string
  templateColumn?: string
  setRows: React.Dispatch<React.SetStateAction<ExcelRow[]>>
  setIdColumn: React.Dispatch<React.SetStateAction<string>>
  setLabelColumn: React.Dispatch<React.SetStateAction<string>>
  setTemplateColumn: React.Dispatch<React.SetStateAction<string>>
}

const ExcelDataContext = React.createContext<ExcelDataContextValue | null>(null)

export const ExcelDataProvider = ExcelDataContext.Provider

export function useExcelData(): ExcelDataContextValue | null {
  return React.useContext(ExcelDataContext)
}
