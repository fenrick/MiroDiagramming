import React from 'react';
import { Button, Checkbox, InputField, Paragraph } from '../components';
import { Icon, Text } from '../components/legacy';
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
          as='input'
          options={{
            className: 'input input-small',
            value: query,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value),
            placeholder: 'Search board text',
          }}
        />
        <InputField
          label='Replace'
          as='input'
          options={{
            className: 'input input-small',
            value: replacement,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setReplacement(e.target.value),
            placeholder: 'Replacement text',
          }}
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
          as='input'
          options={{
            className: 'input input-small',
            value: tagIds,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setTagIds(e.target.value),
            placeholder: 'Comma separated',
          }}
        />
        <InputField
          label='Background colour'
          as='input'
          options={{
            className: 'input input-small',
            value: backgroundColor,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setBackgroundColor(e.target.value),
            placeholder: 'CSS colour',
          }}
        />
        <InputField
          label='Assignee ID'
          as='input'
          options={{
            className: 'input input-small',
            value: assignee,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setAssignee(e.target.value),
            placeholder: 'User ID',
          }}
        />
        <InputField
          label='Creator ID'
          as='input'
          options={{
            className: 'input input-small',
            value: creator,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setCreator(e.target.value),
            placeholder: 'User ID',
          }}
        />
        <InputField
          label='Last modified by'
          as='input'
          options={{
            className: 'input input-small',
            value: lastModifiedBy,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setLastModifiedBy(e.target.value),
            placeholder: 'User ID',
          }}
        />
        <Paragraph data-testid='match-count'>
          Matches: {results.length}
        </Paragraph>
        <div className='buttons'>
          <Button
            onClick={nextMatch}
            disabled={!results.length}
            variant='secondary'>
            <React.Fragment key='.0'>
              <Icon name='chevron-right' />
              <Text>Next</Text>
            </React.Fragment>
          </Button>
          <Button
            onClick={replaceCurrent}
            disabled={!results.length}
            variant='secondary'>
            <React.Fragment key='.1'>
              <Icon name='edit' />
              <Text>Replace</Text>
            </React.Fragment>
          </Button>
          <Button
            onClick={replaceAll}
            variant='primary'>
            <React.Fragment key='.2'>
              <Icon name='arrow-right' />
              <Text>Replace All</Text>
            </React.Fragment>
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
