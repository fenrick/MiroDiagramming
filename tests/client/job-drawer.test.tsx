/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { JobDrawer } from '../src/components/JobDrawer'
import type { Job } from '../src/core/hooks/useJob'

vi.useFakeTimers()
let job: Job
vi.mock('../src/core/hooks/useJob', () => ({ useJob: () => job }))
afterEach(() => {
  vi.clearAllTimers()
})

test('hides successful operations after delay', async () => {
  job = {
    id: '1',
    status: 'working',
    operations: [{ id: 'a', status: 'done' }],
  }
  render(<JobDrawer jobId="1" isOpen onClose={() => {}} />)
  expect(screen.getByText('a')).toBeInTheDocument()
  await vi.advanceTimersByTimeAsync(2000)
  await Promise.resolve()
  expect(screen.queryByText('a')).toBeNull()
})

test('failed operations persist with actions', async () => {
  job = {
    id: '2',
    status: 'failed',
    operations: [{ id: 'b', status: 'failed' }],
  }
  render(<JobDrawer jobId="2" isOpen onClose={() => {}} />)
  await vi.runAllTimersAsync()
  expect(screen.getByText('b')).toBeInTheDocument()
  expect(screen.getByText('Retry')).toBeInTheDocument()
  expect(screen.getByText('Details')).toBeInTheDocument()
})

test('toggle defaults to enabled', () => {
  job = { id: '5', status: 'working', operations: [] }
  render(<JobDrawer jobId="5" isOpen onClose={() => {}} />)
  expect(screen.getByLabelText('Close when done')).toBeChecked()
})

test('auto closes when job completes', async () => {
  job = { id: '3', status: 'done', operations: [] }
  const onClose = vi.fn()
  render(<JobDrawer jobId="3" isOpen onClose={onClose} />)
  await Promise.resolve()
  expect(onClose).toHaveBeenCalled()
})

test('focuses first failed operation on failure', async () => {
  job = {
    id: '4',
    status: 'failed',
    operations: [
      { id: 'x', status: 'failed' },
      { id: 'y', status: 'done' },
    ],
  }
  render(<JobDrawer jobId="4" isOpen onClose={() => {}} />)
  const item = screen.getByText('x').closest('li')
  expect(item).toHaveFocus()
})

test('announces job start', () => {
  job = {
    id: '6',
    status: 'working',
    operations: [
      { id: 'a', status: 'pending' },
      { id: 'b', status: 'pending' },
      { id: 'c', status: 'pending' },
      { id: 'd', status: 'pending' },
      { id: 'e', status: 'pending' },
    ],
  }
  render(<JobDrawer jobId="6" isOpen onClose={() => {}} />)
  expect(screen.getByText('Syncing 5 changes…')).toBeInTheDocument()
})
