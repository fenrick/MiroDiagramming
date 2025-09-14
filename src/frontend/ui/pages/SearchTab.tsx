import { Grid, IconArrowRight, IconChevronRight, IconPen, Text } from '@mirohq/design-system'
import React from 'react'

import type { SearchOptions } from '../../board/search-tools'
import {
  Button,
  ButtonToolbar,
  FilterDropdown,
  InputField,
  Paragraph,
  RegexSearchField,
} from '../components'
import { PageHelp } from '../components/PageHelp'
import { TabPanel } from '../components/TabPanel'
import {
  useDebouncedSearch,
  useNextMatch,
  useReplaceAll,
  useReplaceCurrent,
} from '../hooks/use-search-handlers'
import { StickyActions } from '../StickyActions'

import type { TabTuple } from './tab-definitions'

/**
 * Sidebar tab providing board wide search and replace.
 */
export const SearchTab: React.FC = () => {
  const [query, setQuery] = React.useState('')
  const [replacement, setReplacement] = React.useState('')
  const [widgetTypes, setWidgetTypes] = React.useState<string[]>([])
  const [tagIds, setTagIds] = React.useState('')
  const [backgroundColor, setBackgroundColor] = React.useState('')
  const [assignee, setAssignee] = React.useState('')
  const [creator, setCreator] = React.useState('')
  const [lastModifiedBy, setLastModifiedBy] = React.useState('')
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [wholeWord, setWholeWord] = React.useState(false)
  const [regex, setRegex] = React.useState(false)

  const focusOnItem = React.useCallback(async (item: unknown): Promise<void> => {
    type ViewportAPI = {
      zoomTo: (items: unknown[]) => Promise<void>
      zoomToObject?: (i: unknown) => Promise<void>
    }
    const vp = globalThis.miro?.board?.viewport as ViewportAPI | undefined
    if (!vp) return
    if (typeof vp.zoomToObject === 'function') {
      await vp.zoomToObject(item)
    } else {
      await vp.zoomTo([item])
    }
  }, [])

  const toggleType = (type: string): void =>
    setWidgetTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )

  const buildOptions = React.useCallback((): SearchOptions => {
    const tags = tagIds
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const opts: SearchOptions = { query }
    const add = <K extends keyof SearchOptions>(
      cond: boolean,
      key: K,
      value: SearchOptions[K],
    ): void => {
      if (cond) {
        opts[key] = value
      }
    }
    add(widgetTypes.length > 0, 'widgetTypes', widgetTypes)
    add(tags.length > 0, 'tagIds', tags)
    add(Boolean(backgroundColor), 'backgroundColor', backgroundColor)
    add(Boolean(assignee), 'assignee', assignee)
    add(Boolean(creator), 'creator', creator)
    add(Boolean(lastModifiedBy), 'lastModifiedBy', lastModifiedBy)
    add(caseSensitive, 'caseSensitive', true)
    add(wholeWord, 'wholeWord', true)
    add(regex, 'regex', true)
    return opts
  }, [
    query,
    widgetTypes,
    tagIds,
    backgroundColor,
    assignee,
    creator,
    lastModifiedBy,
    caseSensitive,
    wholeWord,
    regex,
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
    focusOnItem,
  )

  const nextMatch = useNextMatch(results, currentIndex, setCurrentIndex, focusOnItem)

  const replaceCurrent = useReplaceCurrent(
    results,
    currentIndex,
    buildOptions,
    replacement,
    setResults,
    setCurrentIndex,
    focusOnItem,
  )

  return (
    <TabPanel tabId="search">
      <PageHelp content="Find and replace text on the board" />
      <Grid columns={2}>
        <Grid.Item>
          <RegexSearchField
            label="Find"
            value={query}
            onChange={(v: string) => setQuery(v)}
            regex={regex}
            onRegexToggle={setRegex}
            placeholder="Search board text"
          />
        </Grid.Item>
        <Grid.Item>
          <InputField
            label="Replace"
            value={replacement}
            onValueChange={(v: string) => setReplacement(v)}
            placeholder="Replacement text"
          />
        </Grid.Item>
        <Grid.Item>
          <FilterDropdown
            widgetTypes={widgetTypes}
            toggleType={toggleType}
            tagIds={tagIds}
            onTagIdsChange={setTagIds}
            backgroundColor={backgroundColor}
            onBackgroundColorChange={setBackgroundColor}
            assignee={assignee}
            onAssigneeChange={setAssignee}
            creator={creator}
            onCreatorChange={setCreator}
            lastModifiedBy={lastModifiedBy}
            onLastModifiedByChange={setLastModifiedBy}
            caseSensitive={caseSensitive}
            onCaseSensitiveChange={setCaseSensitive}
            wholeWord={wholeWord}
            onWholeWordChange={setWholeWord}
          />
        </Grid.Item>
        <Grid.Item>
          <Paragraph data-testid="match-count">Matches: {results.length}</Paragraph>
        </Grid.Item>
        <Grid.Item>
          <StickyActions>
            <ButtonToolbar>
              <Button
                onClick={nextMatch}
                disabled={!results.length}
                variant="secondary"
                icon={<IconChevronRight />}
                iconPosition="start"
              >
                <Text>Next</Text>
              </Button>
              <Button
                onClick={replaceCurrent}
                disabled={!results.length}
                variant="secondary"
                icon={<IconPen />}
                iconPosition="start"
              >
                <Text>Replace</Text>
              </Button>
              <Button
                onClick={replaceAll}
                variant="primary"
                icon={<IconArrowRight />}
                iconPosition="start"
              >
                <Text>Replace All</Text>
              </Button>
            </ButtonToolbar>
          </StickyActions>
        </Grid.Item>
      </Grid>
    </TabPanel>
  )
}

export const tabDef: TabTuple = [
  8,
  'search',
  'Search',
  'Find and replace text on the board',
  SearchTab,
]
