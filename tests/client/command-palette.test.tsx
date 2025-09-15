/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { CommandPalette, type CommandItem } from '../src/ui/components/CommandPalette'

vi.mock('../src/ui/components/Modal', () => ({
  Modal: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div>,
}))

describe('command palette', () => {
  afterEach(() => {
    delete (global as any).miro
  })

  test('arrow navigation executes selected command', () => {
    const calls: string[] = []
    const commands: CommandItem[] = [
      { id: 'a', label: 'Alpha', action: () => calls.push('a') },
      { id: 'b', label: 'Beta', action: () => calls.push('b') },
    ]
    render(<CommandPalette isOpen onClose={() => undefined} commands={commands} />)
    const input = screen.getByLabelText('Command')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(calls).toEqual(['b'])
  })
})
