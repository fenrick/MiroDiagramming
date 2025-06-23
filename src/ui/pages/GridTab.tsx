import React from 'react';
import {
  Button,
  Input,
  Checkbox,
  InputLabel,
  Icon,
  Text,
} from '../components/legacy';
import { applyGridLayout, GridOptions } from '../../board/grid-tools';
import type { TabTuple } from './tab-definitions';

/** UI for the Grid tab. */
export const GridTab: React.FC = () => {
  const [grid, setGrid] = React.useState<GridOptions>({
    cols: 2,
    padding: 20,
    groupResult: false,
    sortByName: false,
  });
  const [frameTitle, setFrameTitle] = React.useState('');

  const updateNumber =
    (key: 'cols' | 'padding') =>
    (value: string): void => {
      setGrid({ ...grid, [key]: Number(value) });
    };

  const toggle = (key: 'groupResult' | 'sortByName') => (): void => {
    setGrid({ ...grid, [key]: !grid[key] });
  };

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
        Gap
        <Input
          type='number'
          value={String(grid.padding)}
          onChange={updateNumber('padding')}
          placeholder='Gap'
        />
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
      <div className='buttons'>
        <Button onClick={apply} variant='primary'>
          <React.Fragment key='.0'>
            <Icon name='grid' />
            <Text>Arrange Grid</Text>
          </React.Fragment>
        </Button>
      </div>
    </div>
  );
};
export const tabDef: TabTuple = [
  4,
  'grid',
  'Grid',
  'Arrange selected items into a grid',
  GridTab,
];
