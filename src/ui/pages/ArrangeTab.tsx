import React from 'react';
import {
  Button,
  Checkbox,
  InputField,
  Icon,
  Select,
  SelectOption,
  Text,
} from '../components/legacy';
import { applyGridLayout, GridOptions } from '../../board/grid-tools';
import { applySpacingLayout, SpacingOptions } from '../../board/spacing-tools';
import type { TabTuple } from './tab-definitions';

/**
 * Combines grid and spacing tools into a single sidebar tab.
 */
export const ArrangeTab: React.FC = () => {
  const [grid, setGrid] = React.useState<GridOptions>({
    cols: 2,
    padding: 20,
    groupResult: false,
    sortByName: false,
    sortOrientation: 'horizontal',
  });
  const [spacing, setSpacing] = React.useState<SpacingOptions>({
    axis: 'x',
    spacing: 20,
    mode: 'move',
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
  const updateAxis = (axis: string): void => {
    if (axis === 'x' || axis === 'y') setSpacing({ ...spacing, axis });
  };
  const updateSpacing = (value: string): void => {
    setSpacing({ ...spacing, spacing: Number(value) });
  };
  const updateMode = (mode: string): void => {
    if (mode === 'move' || mode === 'grow') setSpacing({ ...spacing, mode });
  };
  const applyGrid = async (): Promise<void> => {
    await applyGridLayout(grid);
  };
  const applySpacing = async (): Promise<void> => {
    await applySpacingLayout(spacing);
  };

  return (
    <div>
      <fieldset className='form-group-small'>
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
            onClick={applyGrid}
            variant='primary'>
            <React.Fragment>
              <Icon name='grid' />
              <Text>Arrange Grid</Text>
            </React.Fragment>
          </Button>
        </div>
      </fieldset>
      <fieldset className='form-group-small'>
        <InputField label='Axis'>
          <Select
            value={spacing.axis}
            onChange={updateAxis}
            className='select-small'>
            <SelectOption value='x'>Horizontal</SelectOption>
            <SelectOption value='y'>Vertical</SelectOption>
          </Select>
        </InputField>
        <InputField label='Mode'>
          <Select
            value={spacing.mode ?? 'move'}
            onChange={updateMode}
            className='select-small'>
            <SelectOption value='move'>Move</SelectOption>
            <SelectOption value='grow'>Expand</SelectOption>
          </Select>
        </InputField>
        <InputField label='Spacing'>
          <input
            className='input input-small'
            type='number'
            value={String(spacing.spacing)}
            onChange={(e) => updateSpacing(e.target.value)}
            placeholder='Distance'
          />
        </InputField>
        <div className='buttons'>
          <Button
            onClick={applySpacing}
            variant='primary'>
            <React.Fragment>
              <Icon name='arrow-right' />
              <Text>Distribute</Text>
            </React.Fragment>
          </Button>
        </div>
      </fieldset>
    </div>
  );
};

export const tabDef: TabTuple = [
  4,
  'arrange',
  'Arrange',
  'Grid and spacing tools',
  ArrangeTab,
];
