/** @vitest-environment jsdom */
import { act, fireEvent, screen } from '@testing-library/react'

import '@testing-library/jest-dom/vitest'
import * as searchTools from '../src/board/search-tools'

import { renderSearchTab } from './render-utils'

vi.useFakeTimers()

describe('SearchTab', () => {
  beforeEach(() => vi.clearAllTimers())

  test('debounced search updates match count', async () => {
    vi.spyOn(searchTools, 'searchBoardContent').mockResolvedValue([{ item: {}, field: 't' }])
    const input = renderSearchTab()
    fireEvent.change(input, { target: { value: 'hello' } })
    expect(searchTools.searchBoardContent).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(300))
    expect(searchTools.searchBoardContent).toHaveBeenCalledWith({
      query: 'hello',
    })
    expect(await screen.findByTestId('match-count')).toHaveTextContent('Matches: 1')
  })

  test('bulk replace calls replaceBoardContent and focuses matches', async () => {
    const match = { item: { id: '1' }, field: 't' }
    vi.spyOn(searchTools, 'searchBoardContent')
      .mockResolvedValueOnce([match])
      .mockResolvedValueOnce([])
    const zoomSpy = vi.fn()
    global.miro = {
      board: { viewport: { zoomTo: vi.fn(), zoomToObject: zoomSpy } },
    } as unknown as typeof global.miro
    const repSpy = vi
      .spyOn(searchTools, 'replaceBoardContent')
      .mockImplementation(async (_o, _b, onMatch) => {
        await onMatch?.(match.item)
        return 1
      })
    const input = renderSearchTab()
    fireEvent.change(input, { target: { value: 'foo' } })
    fireEvent.click(screen.getByRole('button', { name: /filters/i }))
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'shape' }))
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: /case sensitive/i }))
    fireEvent.click(screen.getByRole('switch', { name: /regex/i }))
    await act(async () => vi.advanceTimersByTime(300))
    fireEvent.change(screen.getByPlaceholderText(/replacement text/i), {
      target: { value: 'bar' },
    })
    await act(async () => fireEvent.click(screen.getByText(/replace all/i)))
    const [optsArg] = repSpy.mock.calls[0]
    expect(optsArg).toEqual({
      query: 'foo',
      widgetTypes: ['shape'],
      replacement: 'bar',
      caseSensitive: true,
      regex: true,
    })
    expect(repSpy.mock.calls[0][2]).toBeInstanceOf(Function)
    expect(zoomSpy).toHaveBeenCalledWith(match.item)
    expect(screen.getByTestId('match-count')).toHaveTextContent('Matches: 0')
  })

  test('filters are passed to search utilities', async () => {
    const searchSpy = vi.spyOn(searchTools, 'searchBoardContent').mockResolvedValue([])
    vi.spyOn(searchTools, 'replaceBoardContent').mockResolvedValue(0)
    const input = renderSearchTab()
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /filters/i }))
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'shape' }))
    fireEvent.change(screen.getByLabelText(/tag ids/i), {
      target: { value: 't1,t2' },
    })
    fireEvent.change(screen.getByLabelText(/background colour/i), {
      target: { value: '#fff' },
    })
    fireEvent.change(screen.getByLabelText(/assignee id/i), {
      target: { value: 'u1' },
    })
    fireEvent.change(screen.getByLabelText(/creator id/i), {
      target: { value: 'c1' },
    })
    fireEvent.change(screen.getByLabelText(/last modified by/i), {
      target: { value: 'm1' },
    })
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: /case sensitive/i }))
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: /whole word/i }))
    fireEvent.click(screen.getByRole('switch', { name: /regex/i }))
    await act(async () => vi.advanceTimersByTime(300))
    expect(searchSpy).toHaveBeenCalledWith({
      query: 'test',
      widgetTypes: ['shape'],
      tagIds: ['t1', 't2'],
      backgroundColor: '#fff',
      assignee: 'u1',
      creator: 'c1',
      lastModifiedBy: 'm1',
      caseSensitive: true,
      wholeWord: true,
      regex: true,
    })
  })

  test('next button zooms to each match', async () => {
    const results = [
      { item: { id: 'a' }, field: 't' },
      { item: { id: 'b' }, field: 't' },
    ]
    vi.spyOn(searchTools, 'searchBoardContent').mockResolvedValue(results)
    global.miro = {
      board: { viewport: { zoomTo: vi.fn(), zoomToObject: vi.fn() } },
    } as unknown as typeof global.miro
    const input = renderSearchTab()
    fireEvent.change(input, { target: { value: 'foo' } })
    await act(async () => vi.advanceTimersByTime(300))
    await act(async () => fireEvent.click(screen.getByText(/next/i)))
    expect(global.miro.board.viewport.zoomToObject).toHaveBeenCalledWith(results[1].item)
    await act(async () => fireEvent.click(screen.getByText(/next/i)))
    expect(global.miro.board.viewport.zoomToObject).toHaveBeenLastCalledWith(results[0].item)
  })

  test('replace button updates single match and focuses it', async () => {
    const result = { item: { id: 'x' }, field: 't' }
    vi.spyOn(searchTools, 'searchBoardContent')
      .mockResolvedValueOnce([result])
      .mockResolvedValueOnce([])
    const zoomSpy = vi.fn()
    global.miro = {
      board: { viewport: { zoomTo: vi.fn(), zoomToObject: zoomSpy } },
    } as unknown as typeof global.miro
    const repSpy = vi
      .spyOn(searchTools, 'replaceBoardContent')
      .mockImplementation(async (_o, _b, onMatch) => {
        await onMatch?.(result.item)
        return 1
      })
    const input = renderSearchTab()
    fireEvent.change(input, { target: { value: 'foo' } })
    await act(async () => vi.advanceTimersByTime(300))
    fireEvent.change(screen.getByPlaceholderText(/replacement text/i), {
      target: { value: 'bar' },
    })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /^replace$/i })))
    expect(repSpy).toHaveBeenCalled()
    const [optsArg2] = repSpy.mock.calls[0]
    expect(optsArg2).toEqual({
      query: 'foo',
      replacement: 'bar',
      inSelection: true,
    })
    const boardArg = repSpy.mock.calls[0][1]
    await expect(boardArg.getSelection()).resolves.toEqual([result.item])
    expect(repSpy.mock.calls[0][2]).toBeInstanceOf(Function)
    expect(zoomSpy).toHaveBeenCalledWith(result.item)
    expect(screen.getByTestId('match-count')).toHaveTextContent('Matches: 0')
  })

  test('clearing query resets matches without new search', async () => {
    const spy = vi
      .spyOn(searchTools, 'searchBoardContent')
      .mockResolvedValue([{ item: {}, field: 't' }])
    const input = renderSearchTab()
    fireEvent.change(input, { target: { value: 'foo' } })
    await act(async () => vi.advanceTimersByTime(300))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(await screen.findByTestId('match-count')).toHaveTextContent('Matches: 1')
    fireEvent.change(input, { target: { value: '' } })
    await act(async () => vi.advanceTimersByTime(300))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('match-count')).toHaveTextContent('Matches: 0')
  })

  test('zoomTo used when zoomToObject unavailable', async () => {
    const results = [
      { item: { id: 'a' }, field: 't' },
      { item: { id: 'b' }, field: 't' },
    ]
    vi.spyOn(searchTools, 'searchBoardContent').mockResolvedValue(results)
    const zoomSpy = vi.fn()
    global.miro = {
      board: { viewport: { zoomTo: zoomSpy } },
    } as unknown as typeof global.miro
    const input = renderSearchTab()
    fireEvent.change(input, { target: { value: 'foo' } })
    await act(async () => vi.advanceTimersByTime(300))
    await act(async () => fireEvent.click(screen.getByText(/next/i)))
    expect(zoomSpy).toHaveBeenCalledWith([results[1].item])
  })

  test('next handles missing viewport gracefully', async () => {
    const results = [
      { item: { id: 'x' }, field: 't' },
      { item: { id: 'y' }, field: 't' },
    ]
    vi.spyOn(searchTools, 'searchBoardContent').mockResolvedValue(results)
    global.miro = {} as unknown as typeof global.miro
    const input = renderSearchTab()
    fireEvent.change(input, { target: { value: 'foo' } })
    await act(async () => vi.advanceTimersByTime(300))
    await act(async () => fireEvent.click(screen.getByText(/next/i)))
    expect(screen.getByTestId('match-count')).toHaveTextContent('Matches: 2')
  })

  test('widget type filter toggles off', async () => {
    const searchSpy = vi.spyOn(searchTools, 'searchBoardContent').mockResolvedValue([])
    const input = renderSearchTab()
    fireEvent.click(screen.getByRole('button', { name: /filters/i }))
    const box = screen.getByRole('menuitemcheckbox', { name: 'shape' })
    fireEvent.click(box)
    fireEvent.click(box)
    fireEvent.change(input, { target: { value: 'foo' } })
    await act(async () => vi.advanceTimersByTime(300))
    expect(searchSpy).toHaveBeenCalledWith({ query: 'foo' })
  })

  test('replace all ignored when query is empty', async () => {
    const repSpy = vi.spyOn(searchTools, 'replaceBoardContent')
    const searchSpy = vi.spyOn(searchTools, 'searchBoardContent')
    renderSearchTab()
    await act(async () => fireEvent.click(screen.getByText(/replace all/i)))
    expect(repSpy).not.toHaveBeenCalled()
    expect(searchSpy).not.toHaveBeenCalled()
  })
})
