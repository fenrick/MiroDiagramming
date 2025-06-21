import React from 'react';
import {
  Button,
  Input,
  Checkbox,
  InputLabel,
  Icon,
  Text,
} from 'mirotone-react';
import { applyGridLayout, GridOptions } from '../grid-tools';

/** UI for the Grid tab. */
export const GridTab: React.FC = () => {
  const [grid, setGrid] = React.useState<GridOptions>({
    cols: 2,
    rows: 2,
    padding: 20,
    groupResult: false,
    sortByName: false,
  });

  const updateNumber =
    (key: 'cols' | 'rows' | 'padding') =>
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
        Rows
        <Input
          type='number'
          value={String(grid.rows)}
          onChange={updateNumber('rows')}
          placeholder='Rows'
        />
      </InputLabel>
      <InputLabel>
        Padding
        <Input
          type='number'
          value={String(grid.padding)}
          onChange={updateNumber('padding')}
          placeholder='Padding'
        />
      </InputLabel>
      <Checkbox
        label='Sort by name'
        value={Boolean(grid.sortByName)}
        onChange={toggle('sortByName')}
      />
      <Checkbox
        label='Group result'
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
