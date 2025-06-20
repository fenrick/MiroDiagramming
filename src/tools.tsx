import React from 'react';
import { Button, Input } from 'mirotone-react';
import {
  applySizeToSelection,
  copySizeFromSelection,
  Size,
} from './resize-tools';
import { applyStyleToSelection, StyleOptions } from './style-tools';
import { applyGridLayout, GridOptions } from './grid-tools';

/** UI for the Resize tab. */
export const ResizeTab: React.FC = () => {
  const [size, setSize] = React.useState<Size | null>(null);

  const copy = async (): Promise<void> => {
    const s = await copySizeFromSelection();
    setSize(s);
  };

  const apply = async (): Promise<void> => {
    if (size) await applySizeToSelection(size);
  };

  return (
    <div>
      <p data-testid='size-display'>
        {size ? `${size.width}×${size.height}` : 'No size copied'}
      </p>
      <Button onClick={copy} size='small'>
        Copy Size
      </Button>
      <Button onClick={apply} size='small'>
        Apply Size
      </Button>
    </div>
  );
};

/** UI for the Style tab. */
export const StyleTab: React.FC = () => {
  const [opts, setOpts] = React.useState<StyleOptions>({
    fillColor: '#ffffff',
    fontColor: '#1a1a1a',
    borderColor: '#1a1a1a',
    borderWidth: 1,
    fontSize: 12,
  });

  const update =
    (key: keyof StyleOptions) =>
    (value: string): void => {
      setOpts({
        ...opts,
        [key]:
          key === 'borderWidth' || key === 'fontSize' ? Number(value) : value,
      });
    };

  const apply = async (): Promise<void> => {
    await applyStyleToSelection(opts);
  };

  return (
    <div>
      <Input
        value={opts.fillColor}
        onChange={update('fillColor')}
        placeholder='Fill color'
      />
      <Input
        value={opts.fontColor}
        onChange={update('fontColor')}
        placeholder='Font color'
      />
      <Input
        value={opts.borderColor}
        onChange={update('borderColor')}
        placeholder='Border color'
      />
      <Input
        type='number'
        value={String(opts.borderWidth)}
        onChange={update('borderWidth')}
        placeholder='Border width'
      />
      <Input
        type='number'
        value={String(opts.fontSize)}
        onChange={update('fontSize')}
        placeholder='Font size'
      />
      <Button onClick={apply} size='small'>
        Apply Style
      </Button>
    </div>
  );
};

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
