import React from 'react';
import { Button, Checkbox, InputField, Paragraph } from '../components';
import { TabGrid } from '../components/TabGrid';
import type { SearchOptions } from '../../board/search-tools';
import {
  useDebouncedSearch,
  useReplaceAll,
  useNextMatch,
  useReplaceCurrent,
} from '../hooks/use-search-handlers';
import { TabPanel } from '../components/TabPanel';
import type { TabTuple } from './tab-definitions';
import {
  IconArrowRight,
  IconChevronRight,
  IconPen,
  Text,
} from '@mirohq/design-system';

/**
 * Sidebar tab providing board wide search and replace.
 */
export const SearchTab: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [replacement, setReplacement] = React.useState('');
  const [widgetTypes, setWidgetTypes] = React.useState<string[]>([]);
  const [tagIds, setTagIds] = React.useState('');
  const [backgroundColor, setBackgroundColor] = React.useState('');
  const [assignee, setAssignee] = React.useState('');
  const [creator, setCreator] = React.useState('');
  const [lastModifiedBy, setLastModifiedBy] = React.useState('');
  const [caseSensitive, setCaseSensitive] = React.useState(false);
  const [wholeWord, setWholeWord] = React.useState(false);
  const [regex, setRegex] = React.useState(false);

  const focusOnItem = React.useCallback(
    async (item: unknown): Promise<void> => {
      const vp = globalThis.miro?.board?.viewport;
      const typedVp = vp as unknown as {
        zoomTo(items: unknown[]): Promise<void>;
        zoomToObject?: (i: unknown) => Promise<void>;
      };
      if (!typedVp) return;
      if (typedVp.zoomToObject) {
        await typedVp.zoomToObject(item);
      } else {
        await typedVp.zoomTo([item]);
      }
    },
    [],
  );

  const toggleType = (type: string): void => {
    setWidgetTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  // eslint-disable-next-line complexity
  const buildOptions = React.useCallback((): SearchOptions => {
    const opts: SearchOptions = { query };
    if (widgetTypes.length) opts.widgetTypes = widgetTypes;
    const tags = tagIds
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length) opts.tagIds = tags;
    if (backgroundColor) opts.backgroundColor = backgroundColor;
    if (assignee) opts.assignee = assignee;
    if (creator) opts.creator = creator;
    if (lastModifiedBy) opts.lastModifiedBy = lastModifiedBy;
    if (caseSensitive) opts.caseSensitive = true;
    if (wholeWord) opts.wholeWord = true;
    if (regex) opts.regex = true;
    return opts;
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
  ]);
  const { results, currentIndex, setResults, setCurrentIndex } =
    useDebouncedSearch(query, buildOptions);

  const replaceAll = useReplaceAll(
    query,
    replacement,
    buildOptions,
    setResults,
    setCurrentIndex,
    focusOnItem,
  );

  const nextMatch = useNextMatch(
    results,
    currentIndex,
    setCurrentIndex,
    focusOnItem,
  );

  const replaceCurrent = useReplaceCurrent(
    results,
    currentIndex,
    buildOptions,
    replacement,
    setResults,
    setCurrentIndex,
    focusOnItem,
  );

  return (
    <TabPanel tabId='search'>
      <TabGrid columns={2}>
        <InputField
          label='Find'
          value={query}
          onValueChange={(v) => setQuery(v)}
          placeholder='Search board text'
        />
        <InputField
          label='Replace'
          value={replacement}
          onValueChange={(v) => setReplacement(v)}
          placeholder='Replacement text'
        />
        <div className='form-group-small'>
          <Checkbox
            label='Case sensitive'
            value={caseSensitive}
            onChange={setCaseSensitive}
          />
          <Checkbox
            label='Whole word'
            value={wholeWord}
            onChange={setWholeWord}
          />
          <Checkbox
            label='Regex'
            value={regex}
            onChange={setRegex}
          />
        </div>
        <div className='form-group-small'>
          <legend className='custom-visually-hidden'>Widget Types</legend>
          <div>
            {['shape', 'card', 'sticky_note', 'text'].map((t) => (
              <Checkbox
                key={t}
                label={t}
                value={widgetTypes.includes(t)}
                onChange={() => toggleType(t)}
              />
            ))}
          </div>
        </div>
        <InputField
          label='Tag IDs'
          value={tagIds}
          onValueChange={(v) => setTagIds(v)}
          placeholder='Comma separated'
        />
        <InputField
          label='Background colour'
          value={backgroundColor}
          onValueChange={(v) => setBackgroundColor(v)}
          placeholder='CSS colour'
        />
        <InputField
          label='Assignee ID'
          value={assignee}
          onValueChange={(v) => setAssignee(v)}
          placeholder='User ID'
        />
        <InputField
          label='Creator ID'
          value={creator}
          onValueChange={(v) => setCreator(v)}
          placeholder='User ID'
        />
        <InputField
          label='Last modified by'
          value={lastModifiedBy}
          onValueChange={(v) => setLastModifiedBy(v)}
          placeholder='User ID'
        />
        <Paragraph data-testid='match-count'>
          Matches: {results.length}
        </Paragraph>
        <div className='buttons'>
          <Button
            onClick={nextMatch}
            disabled={!results.length}
            variant='secondary'
            icon={<IconChevronRight />}
            iconPosition='start'>
            <Text>Next</Text>
          </Button>
          <Button
            onClick={replaceCurrent}
            disabled={!results.length}
            variant='secondary'
            icon={<IconPen />}
            iconPosition='start'>
            <Text>Replace</Text>
          </Button>
          <Button
            onClick={replaceAll}
            variant='primary'
            icon={<IconArrowRight />}
            iconPosition='start'>
            <Text>Replace All</Text>
          </Button>
        </div>
      </TabGrid>
    </TabPanel>
  );
};

export const tabDef: TabTuple = [
  8,
  'search',
  'Search',
  'Find and replace text on the board',
  SearchTab,
];
