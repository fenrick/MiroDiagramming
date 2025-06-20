import React from 'react';
import { Button, Input } from 'mirotone-react';
import { applyGridLayout, GridOptions } from '../grid-tools';

/** UI for the Grid tab. */
export const GridTab: React.FC = () => {
  const [grid, setGrid] = React.useState<GridOptions>({
    cols: 2,
    rows: 2,
    padding: 20,
  });

  const update =
    (key: keyof GridOptions) =>
    (value: string): void => {
      setGrid({ ...grid, [key]: Number(value) });
    };

  const apply = async (): Promise<void> => {
    await applyGridLayout(grid);
  };

  return (
    <div>
      <Input
        type='number'
        value={String(grid.cols)}
        onChange={update('cols')}
        placeholder='Columns'
      />
      <Input
        type='number'
        value={String(grid.rows)}
        onChange={update('rows')}
        placeholder='Rows'
      />
      <Input
        type='number'
        value={String(grid.padding)}
        onChange={update('padding')}
        placeholder='Padding'
      />
      <Button onClick={apply} size='small'>
        Arrange Grid
      </Button>
    </div>
  );
};
