import React from 'react';
import {
  Button,
  Checkbox,
  InputField,
  Paragraph,
  Icon,
  Text,
} from '../components/legacy';
import {
  searchBoardContent,
  replaceBoardContent,
  type SearchOptions,
  type SearchResult,
} from '../../board/search-tools';
import type { TabTuple } from './tab-definitions';

/**
 * Sidebar tab providing board wide search and replace.
 */
export const SearchTab: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [replacement, setReplacement] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(-1);
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

  React.useEffect(() => {
    const handle = setTimeout(() => {
      void (async (): Promise<void> => {
        if (!query) {
          setResults([]);
          setCurrentIndex(-1);
          return;
        }
        const res = await searchBoardContent(buildOptions());
        setResults(res);
        setCurrentIndex(res.length ? 0 : -1);
      })();
    }, 300);
    return () => clearTimeout(handle);
  }, [buildOptions, query]);

  const replaceAll = (): void => {
    void (async (): Promise<void> => {
      if (!query) return;
      const count = await replaceBoardContent(
        { ...buildOptions(), replacement },
        undefined,
        focusOnItem,
      );
      if (count) {
        const res = await searchBoardContent(buildOptions());
        setResults(res);
        setCurrentIndex(res.length ? 0 : -1);
      }
    })();
  };

  const nextMatch = (): void => {
    void (async (): Promise<void> => {
      if (!results.length) return;
      const next = (currentIndex + 1) % results.length;
      setCurrentIndex(next);
      const { item } = results[next];
      await focusOnItem(item);
    })();
  };

  const replaceCurrent = (): void => {
    void (async (): Promise<void> => {
      if (!results.length) return;
      const board = {
        getSelection: async () => [results[currentIndex].item],
        get: async () => [],
      } as unknown as Parameters<typeof replaceBoardContent>[1];
      await replaceBoardContent(
        { ...buildOptions(), replacement, inSelection: true },
        board,
        focusOnItem,
      );
      const res = await searchBoardContent(buildOptions());
      setResults(res);
      setCurrentIndex(res.length ? Math.min(currentIndex, res.length - 1) : -1);
    })();
  };

  return (
    <div>
      <InputField label='Find'>
        <input
          className='input input-small'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search board text'
        />
      </InputField>
      <InputField label='Replace'>
        <input
          className='input input-small'
          value={replacement}
          onChange={(e) => setReplacement(e.target.value)}
          placeholder='Replacement text'
        />
      </InputField>
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
      <fieldset className='form-group-small'>
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
      </fieldset>
      <InputField label='Tag IDs'>
        <input
          className='input input-small'
          value={tagIds}
          onChange={(e) => setTagIds(e.target.value)}
          placeholder='Comma separated'
        />
      </InputField>
      <InputField label='Background colour'>
        <input
          className='input input-small'
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          placeholder='CSS colour'
        />
      </InputField>
      <InputField label='Assignee ID'>
        <input
          className='input input-small'
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          placeholder='User ID'
        />
      </InputField>
      <InputField label='Creator ID'>
        <input
          className='input input-small'
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          placeholder='User ID'
        />
      </InputField>
      <InputField label='Last modified by'>
        <input
          className='input input-small'
          value={lastModifiedBy}
          onChange={(e) => setLastModifiedBy(e.target.value)}
          placeholder='User ID'
        />
      </InputField>
      <Paragraph data-testid='match-count'>Matches: {results.length}</Paragraph>
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
    </div>
  );
};

export const tabDef: TabTuple = [
  8,
  'search',
  'Search',
  'Find and replace text on the board',
  SearchTab,
];
