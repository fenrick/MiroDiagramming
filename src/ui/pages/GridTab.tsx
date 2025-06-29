import React from 'react';
import {
  Button,
  Checkbox,
  InputField,
  Icon,
  Text,
  Select,
  SelectOption,
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
    sortOrientation: 'horizontal',
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

  const setOrientation = (value: string): void => {
    setGrid({ ...grid, sortOrientation: value as 'horizontal' | 'vertical' });
  };

  const apply = (): void => {
    void applyGridLayout(grid);
  };

  return (
    <div>
      <InputField label='Columns'>
        <input
          className='input input-small'
          type='number'
          value={String(grid.cols)}
          onChange={(e) => updateNumber('cols')(e.target.value)}
          placeholder='Columns'
        />
      </InputField>
      <InputField label='Gap'>
        <input
          className='input input-small'
          type='number'
          value={String(grid.padding)}
          onChange={(e) => updateNumber('padding')(e.target.value)}
          placeholder='Gap'
        />
      </InputField>
      <Checkbox
        label='Sort by name'
        value={Boolean(grid.sortByName)}
        onChange={toggle('sortByName')}
      />
      {grid.sortByName && (
        <InputField label='Order'>
          <Select
            value={grid.sortOrientation}
            onChange={setOrientation}
            className='select-small'>
            <SelectOption value='horizontal'>Horizontally</SelectOption>
            <SelectOption value='vertical'>Vertically</SelectOption>
          </Select>
        </InputField>
      )}
      <Checkbox
        label='Group items into Frame'
        value={Boolean(grid.groupResult)}
        onChange={toggle('groupResult')}
      />
      {grid.groupResult && (
        <InputField label='Frame Title'>
          <input
            className='input input-small'
            value={frameTitle}
            onChange={(e) => setFrameTitle(e.target.value)}
            placeholder='Optional'
          />
        </InputField>
      )}
      <div className='buttons'>
        <Button
          onClick={apply}
          variant='primary'>
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
