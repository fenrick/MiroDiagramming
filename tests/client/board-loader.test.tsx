import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { expect, test, vi } from 'vitest'

import { BoardLoader } from '../src/components/BoardLoader'

vi.mock('logfire', () => ({
  span: (_: string, fn: () => unknown) => fn(),
  warning: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}))

test('renders cached shapes after skeleton delay', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ shapes: [{ id: 's1' }], version: 1 }),
    } as Response),
  )
  vi.stubGlobal('miro', {
    board: { getUserInfo: vi.fn().mockResolvedValue({ id: 'u1' }) },
  })
  render(<BoardLoader boardId="b1" />)
  expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  await screen.findByText('s1')
  const call = (fetch as unknown as vi.Mock).mock.calls[0]
  expect(call[0]).toBe('/api/boards/b1/shapes?since=0')
})

test('shows empty state when no cache', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ shapes: [], version: 1 }),
    } as Response),
  )
  vi.stubGlobal('miro', {
    board: { getUserInfo: vi.fn().mockResolvedValue({ id: 'u1' }) },
  })
  render(<BoardLoader boardId="b2" />)
  await screen.findByText('No items yet. Create shapes or import.')
})

test('refresh button reloads shapes', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shapes: [{ id: 's1' }], version: 1 }),
    } as Response)
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response)
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shapes: [{ id: 's2' }], version: 2 }),
    } as Response)
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('miro', {
    board: { getUserInfo: vi.fn().mockResolvedValue({ id: 'u1' }) },
  })
  render(<BoardLoader boardId="b3" />)
  await screen.findByText('s1')
  await userEvent.click(screen.getByRole('button', { name: 'Refresh board' }))
  await screen.findByText('s2')
  expect(fetchMock.mock.calls[1][0]).toBe('/api/boards/b3/shapes/refresh')
})
