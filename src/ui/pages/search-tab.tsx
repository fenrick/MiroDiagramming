import React from 'react'
import { Button } from '@base-ui-components/react/button'
import { Checkbox } from '@base-ui-components/react/checkbox'
import { Field } from '@base-ui-components/react/field'

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
      <div>
        <PageHelp content="Find and replace text on the board" />

        <section title="Find & Replace">
          <Field.Root className="form-group form-group-small">
            <Field.Label>Find</Field.Label>
            <Field.Control
              className="input input-small"
              value={query}
              onValueChange={(value) => {
                setQuery(value)
              }}
              placeholder="Search board text"
            />
          </Field.Root>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Replace</Field.Label>
            <Field.Control
              className="input input-small"
              value={replacement}
              onValueChange={(value) => {
                setReplacement(value)
              }}
              placeholder="Replacement text"
            />
          </Field.Root>
          <label className="inline-field form-group form-group-small">
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
          <label className="inline-field form-group form-group-small">
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
          <label className="inline-field form-group form-group-small">
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

        <section title="Filters">
          <InfoCallout title="Tips">
            Combine type, tags, and colour to narrow matches. Toggle Regex for advanced patterns.
            Case and whole-word are applied client-side.
          </InfoCallout>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Widget types (comma separated)</Field.Label>
            <Field.Control
              className="input input-small"
              value={widgetTypesText}
              onValueChange={(value) => {
                setWidgetTypesText(value)
              }}
              placeholder="e.g. sticker,shape,text"
            />
          </Field.Root>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Tag IDs (comma separated)</Field.Label>
            <Field.Control
              className="input input-small"
              value={tagIds}
              onValueChange={(value) => {
                setTagIds(value)
              }}
            />
          </Field.Root>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Background color</Field.Label>
            <Field.Control
              className="input input-small"
              value={backgroundColor}
              onValueChange={(value) => {
                setBackgroundColor(value)
              }}
            />
          </Field.Root>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Assignee</Field.Label>
            <Field.Control
              className="input input-small"
              value={assignee}
              onValueChange={(value) => {
                setAssignee(value)
              }}
            />
          </Field.Root>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Creator</Field.Label>
            <Field.Control
              className="input input-small"
              value={creator}
              onValueChange={(value) => {
                setCreator(value)
              }}
            />
          </Field.Root>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Last modified by</Field.Label>
            <Field.Control
              className="input input-small"
              value={lastModifiedBy}
              onValueChange={(value) => {
                setLastModifiedBy(value)
              }}
            />
          </Field.Root>
        </section>

        <section title="Results">
          <p data-testid="match-count">Matches: {results.length}</p>
          {query && results.length === 0 && (
            <p>No matches found. Adjust filters or turn off regex.</p>
          )}
          <StickyActions>
            <div>
              <Button
                className="button button-secondary button-medium"
                onClick={() => void nextMatch()}
                disabled={results.length === 0}
              >
                <span className="icon icon-arrows-right" aria-hidden="true"></span>
                <p className="p-medium">Next</p>
              </Button>
              <Button
                className="button button-secondary button-medium"
                onClick={() => void replaceCurrent()}
                disabled={results.length === 0}
              >
                <span className="icon icon-edit" aria-hidden="true"></span>
                <p className="p-medium">Replace</p>
              </Button>
              <Button
                className="button button-primary button-medium"
                onClick={() => void replaceAll()}
                disabled={results.length === 0}
              >
                <span className="icon icon-arrow-right" aria-hidden="true"></span>
                <p className="p-medium">Replace All</p>
              </Button>
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
