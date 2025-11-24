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
    const options: SearchOptions = { query }
    const widgetTypes = parseList(widgetTypesText)
    if (widgetTypes.length > 0) options.widgetTypes = widgetTypes
    const tags = parseList(tagIds)
    if (tags.length > 0) options.tagIds = tags
    if (backgroundColor) options.backgroundColor = backgroundColor
    if (assignee) options.assignee = assignee
    if (creator) options.creator = creator
    if (lastModifiedBy) options.lastModifiedBy = lastModifiedBy
    if (caseSensitive) options.caseSensitive = true
    if (wholeWord) options.wholeWord = true
    if (regex) options.regex = true
    return options
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
    async (item) => {
      const maybeMiro = (globalThis as any).miro as { board?: { viewport?: any } } | undefined
      if (maybeMiro?.board?.viewport) {
        if (typeof maybeMiro.board.viewport.zoomToObject === 'function') {
          await maybeMiro.board.viewport.zoomToObject(item)
        } else if (typeof maybeMiro.board.viewport.zoomTo === 'function') {
          await maybeMiro.board.viewport.zoomTo([item])
        }
      }
    },
  )

  const nextMatch = useNextMatch(results, currentIndex, setCurrentIndex, async (item) => {
    const maybeMiro = (globalThis as any).miro as { board?: { viewport?: any } } | undefined
    if (maybeMiro?.board?.viewport) {
      if (typeof maybeMiro.board.viewport.zoomToObject === 'function') {
        await maybeMiro.board.viewport.zoomToObject(item)
      } else if (typeof maybeMiro.board.viewport.zoomTo === 'function') {
        await maybeMiro.board.viewport.zoomTo([item])
      }
    }
  })

  const replaceCurrent = useReplaceCurrent(
    results,
    currentIndex,
    buildOptions,
    replacement,
    setResults,
    setCurrentIndex,
    async (item) => {
      const maybeMiro = (globalThis as any).miro as { board?: { viewport?: any } } | undefined
      if (maybeMiro?.board?.viewport) {
        if (typeof maybeMiro.board.viewport.zoomToObject === 'function') {
          await maybeMiro.board.viewport.zoomToObject(item)
        } else if (typeof maybeMiro.board.viewport.zoomTo === 'function') {
          await maybeMiro.board.viewport.zoomTo([item])
        }
      }
    },
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
              onValueChange={(v) => {
                setQuery(String(v))
              }}
              placeholder="Search board text"
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Replace</span>
            <Input
              className="input"
              value={replacement}
              onValueChange={(v) => {
                setReplacement(String(v))
              }}
              placeholder="Replacement text"
            />
          </div>
          <label className="inline-field">
            <Checkbox.Root
              checked={regex}
              onCheckedChange={(c) => {
                setRegex(Boolean(c))
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
              onCheckedChange={(c) => {
                setCaseSensitive(Boolean(c))
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
              onCheckedChange={(c) => {
                setWholeWord(Boolean(c))
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
              onValueChange={(v) => {
                setWidgetTypesText(String(v))
              }}
              placeholder="e.g. sticker,shape,text"
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Tag IDs (comma separated)</span>
            <Input
              className="input"
              value={tagIds}
              onValueChange={(v) => {
                setTagIds(String(v))
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Background color</span>
            <Input
              className="input"
              value={backgroundColor}
              onValueChange={(v) => {
                setBackgroundColor(String(v))
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Assignee</span>
            <Input
              className="input"
              value={assignee}
              onValueChange={(v) => {
                setAssignee(String(v))
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Creator</span>
            <Input
              className="input"
              value={creator}
              onValueChange={(v) => {
                setCreator(String(v))
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Last modified by</span>
            <Input
              className="input"
              value={lastModifiedBy}
              onValueChange={(v) => {
                setLastModifiedBy(String(v))
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
