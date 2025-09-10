import React from 'react'
import {
  replaceBoardContent,
  searchBoardContent,
  SearchOptions,
  SearchResult,
} from '../../board/search-tools'

/**
 * Perform a board search with a 300 ms debounce.
 *
 * @param query - Text to search for.
 * @param buildOptions - Builder returning search options for the query.
 * @returns State and setters tracking the current matches.
 */
export function useDebouncedSearch(
  query: string,
  buildOptions: () => SearchOptions,
): {
  results: SearchResult[]
  currentIndex: number
  setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
} {
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [currentIndex, setCurrentIndex] = React.useState(-1)

  React.useEffect(() => {
    const handle = setTimeout(async () => {
      if (!query) {
        setResults([])
        setCurrentIndex(-1)
        return
      }
      const res = await searchBoardContent(buildOptions())
      setResults(res)
      setCurrentIndex(res.length ? 0 : -1)
    }, 300)
    return () => clearTimeout(handle)
  }, [buildOptions, query])

  return { results, currentIndex, setResults, setCurrentIndex }
}

/**
 * Replace all matching occurrences on the board.
 *
 * @param query - Search text.
 * @param replacement - Replacement string.
 * @param buildOptions - Builder returning additional search options.
 * @param setResults - Setter receiving the refreshed matches.
 * @param setCurrentIndex - Setter for the active match index.
 * @param focusOnItem - Callback to focus the board on a match.
 */
export function useReplaceAll(
  query: string,
  replacement: string,
  buildOptions: () => SearchOptions,
  setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
  focusOnItem: (item: unknown) => Promise<void>,
): () => Promise<void> {
  return React.useCallback(async () => {
    if (!query) {
      return
    }
    const count = await replaceBoardContent(
      { ...buildOptions(), replacement },
      undefined,
      focusOnItem,
    )
    if (count) {
      const res = await searchBoardContent(buildOptions())
      setResults(res)
      setCurrentIndex(res.length ? 0 : -1)
    }
  }, [buildOptions, focusOnItem, query, replacement, setCurrentIndex, setResults])
}

/**
 * Cycle focus through the list of search results.
 *
 * @param results - Search results to iterate over.
 * @param currentIndex - Index currently in focus.
 * @param setCurrentIndex - Setter updating the index.
 * @param focusOnItem - Callback focusing the board on a result.
 */
export function useNextMatch(
  results: SearchResult[],
  currentIndex: number,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
  focusOnItem: (item: unknown) => Promise<void>,
): () => Promise<void> {
  return React.useCallback(async () => {
    if (!results.length) {
      return
    }
    const next = (currentIndex + 1) % results.length
    setCurrentIndex(next)
    const { item } = results[next]!
    await focusOnItem(item)
  }, [currentIndex, focusOnItem, results, setCurrentIndex])
}

/**
 * Replace the currently highlighted search match.
 *
 * @param results - Available search results.
 * @param currentIndex - Index of the item to replace.
 * @param buildOptions - Builder returning search options for the current query.
 * @param replacement - Text to insert for the match.
 * @param setResults - Setter for the updated result set.
 * @param setCurrentIndex - Setter updating the active index.
 * @param focusOnItem - Callback focusing the board on the replaced item.
 */
export function useReplaceCurrent(
  results: SearchResult[],
  currentIndex: number,
  buildOptions: () => SearchOptions,
  replacement: string,
  setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
  focusOnItem: (item: unknown) => Promise<void>,
): () => Promise<void> {
  return React.useCallback(async () => {
    if (!results.length) {
      return
    }
    const current = results[currentIndex]
    if (!current) {
      return
    }
    const board = {
      getSelection: async () => [current.item],
      get: async () => [],
    } as unknown as Parameters<typeof replaceBoardContent>[1]
    await replaceBoardContent(
      { ...buildOptions(), replacement, inSelection: true },
      board,
      focusOnItem,
    )
    const res = await searchBoardContent(buildOptions())
    setResults(res)
    setCurrentIndex(res.length ? Math.min(currentIndex, res.length - 1) : -1)
  }, [buildOptions, currentIndex, focusOnItem, replacement, results, setCurrentIndex, setResults])
}
