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
} from '../../board/search-tools';
import type { TabTuple } from './tab-definitions';

/**
 * Sidebar tab providing board wide search and replace.
 */
export const SearchTab: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [replacement, setReplacement] = React.useState('');
  const [matches, setMatches] = React.useState(0);
  const [widgetTypes, setWidgetTypes] = React.useState<string[]>([]);
  const [tagIds, setTagIds] = React.useState('');
  const [backgroundColor, setBackgroundColor] = React.useState('');
  const [assignee, setAssignee] = React.useState('');
  const [creator, setCreator] = React.useState('');
  const [lastModifiedBy, setLastModifiedBy] = React.useState('');

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
    return opts;
  }, [
    query,
    widgetTypes,
    tagIds,
    backgroundColor,
    assignee,
    creator,
    lastModifiedBy,
  ]);

  React.useEffect(() => {
    const handle = setTimeout(async () => {
      if (!query) {
        setMatches(0);
        return;
      }
      const res = await searchBoardContent(buildOptions());
      setMatches(res.length);
    }, 300);
    return () => clearTimeout(handle);
  }, [buildOptions]);

  const replace = async (): Promise<void> => {
    if (!query) return;
    const count = await replaceBoardContent({ ...buildOptions(), replacement });
    setMatches(Math.max(0, matches - count));
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
        <label>Widget Types</label>
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
      <Paragraph data-testid='match-count'>Matches: {matches}</Paragraph>
      <div className='buttons'>
        <Button
          onClick={replace}
          variant='primary'>
          <React.Fragment key='.0'>
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
