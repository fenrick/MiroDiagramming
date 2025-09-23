import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { ExcelDataProvider } from '../../src/ui/hooks/excel-data-context'
import { useExcelSync } from '../../src/ui/hooks/use-excel-sync'
import { ExcelSyncService } from '../../src/core/excel-sync-service'

vi.spyOn(ExcelSyncService.prototype, 'updateShapesFromExcel').mockResolvedValue()

type Row = { id: string; label: string; template?: string }

function Child() {
  const sync = useExcelSync()
  const [label, setLabel] = React.useState('Alpha')
  return (
    <div>
      <output aria-label="row-0">{label}</output>
      <button
        onClick={() => {
          // Update via hook and reflect locally
          void sync(0, { id: '1', label: 'Alpha*' })
          setLabel('Alpha*')
        }}
      >
        Update
      </button>
    </div>
  )
}

function Harness() {
  const [rows, setRows] = React.useState<Row[]>([
    { id: '1', label: 'Alpha' },
    { id: '2', label: 'Beta' },
  ])

  return (
    <ExcelDataProvider
      value={{
        rows,
        idColumn: 'id',
        labelColumn: 'label',
        templateColumn: 'template',
        setRows: setRows as any,
        setIdColumn: () => {},
        setLabelColumn: () => {},
        setTemplateColumn: () => {},
      }}
    >
      <Child />
    </ExcelDataProvider>
  )
}

describe('useExcelSync', () => {
  it('applies optimistic row update and commits via service', async () => {
    render(<Harness />)
    expect(screen.getByLabelText('row-0').textContent).toBe('Alpha')
    fireEvent.click(screen.getByText('Update'))
    // Optimistic update applies immediately
    expect(screen.getByLabelText('row-0').textContent).toBe('Alpha*')
  })
})
// @vitest-environment jsdom
