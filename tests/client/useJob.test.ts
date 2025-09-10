/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { useJob } from '../src/core/hooks/useJob'
import * as api from '../src/core/utils/api-fetch'

vi.useFakeTimers()
afterEach(() => {
  vi.clearAllMocks()
})

test('polls until job completes', async () => {
  const spy = vi
    .spyOn(api, 'apiFetch')
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ id: '1', status: 'working', operations: [] })),
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ id: '1', status: 'done', operations: [] })),
    )
  const { result } = renderHook(() => useJob('1'))
  await Promise.resolve()
  await vi.advanceTimersByTimeAsync(1000)
  await Promise.resolve()
  expect(spy).toHaveBeenNthCalledWith(1, '/api/jobs/1')
  expect(spy).toHaveBeenNthCalledWith(2, '/api/jobs/1')
  expect(spy).toHaveBeenCalledTimes(2)
  expect(result.current?.status).toBe('done')
})

test('returns cached result for duplicate job id', async () => {
  const spy = vi
    .spyOn(api, 'apiFetch')
    .mockResolvedValue(new Response(JSON.stringify({ id: '1', status: 'done', operations: [] })))
  const { result, unmount } = renderHook(() => useJob('1'))
  await Promise.resolve()
  await vi.runAllTimersAsync()
  expect(spy).toHaveBeenCalledWith('/api/jobs/1')
  expect(spy).toHaveBeenCalledTimes(1)
  expect(result.current?.status).toBe('done')
  unmount()
  const { result: second } = renderHook(() => useJob('1'))
  expect(spy).toHaveBeenCalledTimes(1)
  expect(second.current?.status).toBe('done')
})
