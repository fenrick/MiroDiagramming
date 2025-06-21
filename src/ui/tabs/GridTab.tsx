import React from 'react';
import {
  Button,
  Input,
  Checkbox,
  InputLabel,
  Icon,
  Text,
  tokens,
} from 'mirotone-react';
import { applyGridLayout, GridOptions } from '../../board/grid-tools';

/** UI for the Grid tab. */
export const GridTab: React.FC = () => {
  const [grid, setGrid] = React.useState<GridOptions>({
    cols: 2,
    rows: 2,
    padding: 20,
    groupResult: false,
    sortByName: false,
  });
  const [frameTitle, setFrameTitle] = React.useState('');

  const updateNumber =
    (key: 'cols' | 'rows' | 'padding') =>
    (value: string): void => {
      setGrid({ ...grid, [key]: Number(value) });
    };

  const toggle = (key: 'groupResult' | 'sortByName') => (): void => {
    setGrid({ ...grid, [key]: !grid[key] });
  };

  const gaps = [
    { label: 'xxs', value: tokens.space.xxsmall },
    { label: 'xs', value: tokens.space.xsmall },
    { label: 'sm', value: tokens.space.small },
    { label: 'md', value: tokens.space.medium },
    { label: 'lg', value: tokens.space.large },
    { label: 'xl', value: tokens.space.xlarge },
  ] as const;

  const apply = async (): Promise<void> => {
    await applyGridLayout(grid);
  };

  return (
    <div>
      <InputLabel>
        Columns
        <Input
          type='number'
          value={String(grid.cols)}
          onChange={updateNumber('cols')}
          placeholder='Columns'
        />
      </InputLabel>
      <InputLabel>
        Rows
        <Input
          type='number'
          value={String(grid.rows)}
          onChange={updateNumber('rows')}
          placeholder='Rows'
        />
      </InputLabel>
      <InputLabel>
        Gap
        <select
          value={String(grid.padding)}
          onChange={e => setGrid({ ...grid, padding: Number(e.target.value) })}
        >
          {gaps.map(g => (
            <option key={g.label} value={g.value as unknown as number}>
              {g.label}
            </option>
          ))}
        </select>
      </InputLabel>
      <InputLabel>
        Frame Title
        <Input
          value={frameTitle}
          onChange={setFrameTitle}
          placeholder='Optional'
        />
      </InputLabel>
      <Checkbox
        label='Sort by name'
        value={Boolean(grid.sortByName)}
        onChange={toggle('sortByName')}
      />
      <Checkbox
        label='Group items into Frame'
        value={Boolean(grid.groupResult)}
        onChange={toggle('groupResult')}
      />
      <Button onClick={apply} size='small' variant='primary'>
        <React.Fragment key='.0'>
          <Icon name='grid' />
          <Text>Arrange Grid</Text>
        </React.Fragment>
      </Button>
    </div>
  );
};
