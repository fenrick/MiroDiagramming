import React from 'react';
import {
  Button,
  InputField,
  Paragraph,
  Icon,
  Text,
} from '../components/legacy';
import {
  searchBoardContent,
  replaceBoardContent,
} from '../../board/search-tools';
import type { TabTuple } from './tab-definitions';

/**
 * Sidebar tab providing board wide search and replace.
 */
export const SearchTab: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [replacement, setReplacement] = React.useState('');
  const [matches, setMatches] = React.useState(0);

  React.useEffect(() => {
    const handle = setTimeout(async () => {
      if (!query) {
        setMatches(0);
        return;
      }
      const res = await searchBoardContent({ query });
      setMatches(res.length);
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const replace = async (): Promise<void> => {
    if (!query) return;
    const count = await replaceBoardContent({ query, replacement });
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
