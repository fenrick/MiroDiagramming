/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { CardProcessor } from '../src/board/card-processor'
import { CardsTab } from '../src/ui/pages/CardsTab'
import { pushToast } from '../src/ui/components/Toast'

vi.mock('../src/ui/components/Toast', () => ({
  pushToast: vi.fn(),
  ToastContainer: () => null,
}))

vi.mock('../src/board/card-processor')

describe('CardsTab extra paths', () => {
  // TODO extend to test server-backed card lookups once card cache is persistent
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).miro = { board: { ui: { on: vi.fn() } } }
  })

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).miro
    vi.clearAllMocks()
  })

  test('creates frame with title when option enabled', async () => {
    const spy = vi
      .spyOn(CardProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined as unknown as void)
    render(<CardsTab />)
    const file = new File(['{}'], 'cards.json', { type: 'application/json' })
    await act(async () =>
      fireEvent.change(screen.getByTestId('file-input'), {
        target: { files: [file] },
      }),
    )
    fireEvent.click(screen.getByLabelText('Wrap items in frame'))
    fireEvent.change(screen.getByPlaceholderText('Frame title'), {
      target: { value: 'T' },
    })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /create cards/i })))
    expect(spy).toHaveBeenCalledWith(file, {
      createFrame: true,
      frameTitle: 'T',
    })
  })

  test('shows error message when processing fails', async () => {
    vi.spyOn(CardProcessor.prototype, 'processFile').mockRejectedValue(new Error('fail'))
    render(<CardsTab />)
    const file = new File(['{}'], 'cards.json', { type: 'application/json' })
    await act(async () =>
      fireEvent.change(screen.getByTestId('file-input'), {
        target: { files: [file] },
      }),
    )
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /create cards/i })))
    expect(pushToast).toHaveBeenCalledWith({ message: 'Error: fail' })
  })
})
