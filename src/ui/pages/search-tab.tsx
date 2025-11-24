import React from 'react'
import { Button as BaseButton } from '@base-ui-components/react/button'
import { Checkbox } from '@base-ui-components/react/checkbox'
import { Input } from '@base-ui-components/react/input'

import type { SearchOptions } from '../../board/search-tools'
import { InfoCallout } from '../components/info-callout'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import {
  useDebouncedSearch,
  useNextMatch,
  useReplaceAll,
  useReplaceCurrent,
} from '../hooks/use-search-handlers'
import { StickyActions } from '../sticky-actions'
import { IconArrowRight, IconChevronRight, IconPen, Text } from '../primitives'
import type { TabTuple } from './tab-definitions'

interface MiroViewport {
  zoomToObject?: (item: unknown) => Promise<void>
  zoomTo?: (items: unknown[]) => Promise<void>
}

interface MiroGlobal {
  board?: { viewport?: MiroViewport }
}

const getViewport = (): MiroViewport | null => {
  const miro = (globalThis as { miro?: MiroGlobal }).miro
  return miro?.board?.viewport ?? null
}

const zoomToItem = async (item: unknown): Promise<void> => {
  const viewport = getViewport()
  if (!viewport) return
  if (typeof viewport.zoomToObject === 'function') {
    await viewport.zoomToObject(item)
    return
  }
  if (typeof viewport.zoomTo === 'function') {
    await viewport.zoomTo([item])
  }
}

const parseList = (value: string): string[] =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

export const SearchTab: React.FC = () => {
  const [query, setQuery] = React.useState('')
  const [replacement, setReplacement] = React.useState('')
  const [widgetTypesText, setWidgetTypesText] = React.useState('')
  const [tagIds, setTagIds] = React.useState('')
  const [backgroundColor, setBackgroundColor] = React.useState('')
  const [assignee, setAssignee] = React.useState('')
  const [creator, setCreator] = React.useState('')
  const [lastModifiedBy, setLastModifiedBy] = React.useState('')
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [wholeWord, setWholeWord] = React.useState(false)
  const [regex, setRegex] = React.useState(false)

  const buildOptions = React.useCallback((): SearchOptions => {
    const widgetTypes = parseList(widgetTypesText)
    const tags = parseList(tagIds)
    return {
      query,
      ...(widgetTypes.length > 0 ? { widgetTypes } : {}),
      ...(tags.length > 0 ? { tagIds: tags } : {}),
      ...(backgroundColor ? { backgroundColor } : {}),
      ...(assignee ? { assignee } : {}),
      ...(creator ? { creator } : {}),
      ...(lastModifiedBy ? { lastModifiedBy } : {}),
      caseSensitive,
      wholeWord,
      regex,
    }
  }, [
    assignee,
    backgroundColor,
    caseSensitive,
    creator,
    lastModifiedBy,
    query,
    regex,
    tagIds,
    wholeWord,
    widgetTypesText,
  ])

  const { results, currentIndex, setResults, setCurrentIndex } = useDebouncedSearch(
    query,
    buildOptions,
  )

  const replaceAll = useReplaceAll(
    query,
    replacement,
    buildOptions,
    setResults,
    setCurrentIndex,
    async (item) => zoomToItem(item),
  )

  const nextMatch = useNextMatch(results, currentIndex, setCurrentIndex, async (item) => {
    await zoomToItem(item)
  })

  const replaceCurrent = useReplaceCurrent(
    results,
    currentIndex,
    buildOptions,
    replacement,
    setResults,
    setCurrentIndex,
    async (item) => zoomToItem(item),
  )

  return (
    <TabPanel tabId="search">
      <div className="stack-md">
        <PageHelp content="Find and replace text on the board" />

        <section className="stack-sm" title="Find & Replace">
          <div className="stack-2xs">
            <span className="label">Find</span>
            <Input
              className="input"
              value={query}
              onValueChange={(value) => {
                setQuery(value)
              }}
              placeholder="Search board text"
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Replace</span>
            <Input
              className="input"
              value={replacement}
              onValueChange={(value) => {
                setReplacement(value)
              }}
              placeholder="Replacement text"
            />
          </div>
          <label className="inline-field">
            <Checkbox.Root
              checked={regex}
              onCheckedChange={(checked) => {
                setRegex(checked)
              }}
              className="checkbox"
            >
              <Checkbox.Indicator>✓</Checkbox.Indicator>
            </Checkbox.Root>
            <span>Regex</span>
          </label>
          <label className="inline-field">
            <Checkbox.Root
              checked={caseSensitive}
              onCheckedChange={(checked) => {
                setCaseSensitive(checked)
              }}
              className="checkbox"
            >
              <Checkbox.Indicator>✓</Checkbox.Indicator>
            </Checkbox.Root>
            <span>Case sensitive</span>
          </label>
          <label className="inline-field">
            <Checkbox.Root
              checked={wholeWord}
              onCheckedChange={(checked) => {
                setWholeWord(checked)
              }}
              className="checkbox"
            >
              <Checkbox.Indicator>✓</Checkbox.Indicator>
            </Checkbox.Root>
            <span>Whole word</span>
          </label>
        </section>

        <section className="stack-sm" title="Filters">
          <InfoCallout title="Tips">
            Combine type, tags, and colour to narrow matches. Toggle Regex for advanced patterns.
            Case and whole-word are applied client-side.
          </InfoCallout>
          <div className="stack-2xs">
            <span className="label">Widget types (comma separated)</span>
            <Input
              className="input"
              value={widgetTypesText}
              onValueChange={(value) => {
                setWidgetTypesText(value)
              }}
              placeholder="e.g. sticker,shape,text"
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Tag IDs (comma separated)</span>
            <Input
              className="input"
              value={tagIds}
              onValueChange={(value) => {
                setTagIds(value)
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Background color</span>
            <Input
              className="input"
              value={backgroundColor}
              onValueChange={(value) => {
                setBackgroundColor(value)
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Assignee</span>
            <Input
              className="input"
              value={assignee}
              onValueChange={(value) => {
                setAssignee(value)
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Creator</span>
            <Input
              className="input"
              value={creator}
              onValueChange={(value) => {
                setCreator(value)
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Last modified by</span>
            <Input
              className="input"
              value={lastModifiedBy}
              onValueChange={(value) => {
                setLastModifiedBy(value)
              }}
            />
          </div>
        </section>

        <section className="stack-sm" title="Results">
          <p data-testid="match-count">Matches: {results.length}</p>
          {query && results.length === 0 && (
            <p style={{ color: 'var(--colors-gray-700)' }}>
              No matches found. Adjust filters or turn off regex.
            </p>
          )}
          <StickyActions>
            <div className="button-group">
              <BaseButton
                className="button button-secondary"
                onClick={() => void nextMatch()}
                disabled={results.length === 0}
              >
                <IconChevronRight />
                <Text>Next</Text>
              </BaseButton>
              <BaseButton
                className="button button-secondary"
                onClick={() => void replaceCurrent()}
                disabled={results.length === 0}
              >
                <IconPen />
                <Text>Replace</Text>
              </BaseButton>
              <BaseButton
                className="button button-primary"
                onClick={() => void replaceAll()}
                disabled={results.length === 0}
              >
                <IconArrowRight />
                <Text>Replace All</Text>
              </BaseButton>
            </div>
          </StickyActions>
        </section>
      </div>
    </TabPanel>
  )
}

export const tabDefinition: TabTuple = [
  8,
  'search',
  'Search',
  'Find and replace text on the board',
  SearchTab,
]

export default SearchTab
