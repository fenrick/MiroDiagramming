import { Grid, IconArrowRight, IconChevronRight, IconPen, Text } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'

import type { SearchOptions } from '../../board/search-tools'
import {
  Button,
  ButtonToolbar,
  InfoCallout,
  EmptyState,
  FilterDropdown,
  InputField,
  Paragraph,
  RegexSearchField,
  SidebarSection,
} from '../components'
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

const CONTENT_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: space[200],
}

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
      zoomToObject?: (item: unknown) => Promise<void>
    }
    const vp = globalThis.miro?.board?.viewport as ViewportAPI | undefined
    if (!vp) {
      return
    }
    await (typeof vp.zoomToObject === 'function' ? vp.zoomToObject(item) : vp.zoomTo([item]))
  }, [])

  const toggleType = (type: string): void =>
    setWidgetTypes((previous) =>
      previous.includes(type) ? previous.filter((t) => t !== type) : [...previous, type],
    )

  const buildOptions = React.useCallback((): SearchOptions => {
    const tags = tagIds
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const options: SearchOptions = { query }
    if (widgetTypes.length > 0) {
      options.widgetTypes = [...widgetTypes]
    }
    if (tags.length > 0) {
      options.tagIds = tags
    }
    if (backgroundColor) {
      options.backgroundColor = backgroundColor
    }
    if (assignee) {
      options.assignee = assignee
    }
    if (creator) {
      options.creator = creator
    }
    if (lastModifiedBy) {
      options.lastModifiedBy = lastModifiedBy
    }
    if (caseSensitive) {
      options.caseSensitive = true
    }
    if (wholeWord) {
      options.wholeWord = true
    }
    if (regex) {
      options.regex = true
    }
    return options
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
      <div style={CONTENT_STYLE}>
        <PageHelp content="Find and replace text on the board" />
        <SidebarSection title="Find & Replace">
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
          </Grid>
        </SidebarSection>
        <SidebarSection title="Filters">
          <div style={{ marginBottom: space[200] }}>
            <InfoCallout title="Tips">
              Combine type, tags, and colour to narrow matches. Toggle Regex for advanced patterns.
              Case and whole-word are applied client-side.
            </InfoCallout>
          </div>
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
        </SidebarSection>
        <SidebarSection title="Results">
          <Paragraph data-testid="match-count">Matches: {results.length}</Paragraph>
          {query && results.length === 0 ? (
            <EmptyState
              title="No matches found"
              description="Try adjusting filters or turning off regex."
            />
          ) : null}
          <StickyActions>
            <ButtonToolbar>
              <Button
                onClick={nextMatch}
                disabled={results.length === 0}
                variant="secondary"
                icon={<IconChevronRight />}
                iconPosition="start"
              >
                <Text>Next</Text>
              </Button>
              <Button
                onClick={replaceCurrent}
                disabled={results.length === 0}
                variant="secondary"
                icon={<IconPen />}
                iconPosition="start"
              >
                <Text>Replace</Text>
              </Button>
              <Button
                onClick={replaceAll}
                disabled={results.length === 0}
                variant="primary"
                icon={<IconArrowRight />}
                iconPosition="start"
              >
                <Text>Replace All</Text>
              </Button>
            </ButtonToolbar>
          </StickyActions>
        </SidebarSection>
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
