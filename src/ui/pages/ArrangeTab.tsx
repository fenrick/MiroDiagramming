import React from 'react';
import {
  Button,
  Checkbox,
  InputField,
  Select,
  SelectOption,
} from '../components';
import { Icon, Text } from '../components/legacy';
import { TabGrid } from '../components/TabGrid';
import { applyGridLayout, GridOptions } from '../../board/grid-tools';
import { applySpacingLayout, SpacingOptions } from '../../board/spacing-tools';
import { TabPanel } from '../components/TabPanel';
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
    <TabPanel tabId='arrange'>
      <TabGrid columns={2}>
        <InputField
          label='Columns'
          as='input'
          options={{
            className: 'input input-small',
            type: 'number',
            value: String(grid.cols),
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              updateNumber('cols')(e.target.value),
            placeholder: 'Columns',
          }}
        />
        <InputField
          label='Gap'
          as='input'
          options={{
            className: 'input input-small',
            type: 'number',
            value: String(grid.padding),
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              updateNumber('padding')(e.target.value),
            placeholder: 'Gap',
          }}
        />
        <Checkbox
          label='Sort by name'
          value={Boolean(grid.sortByName)}
          onChange={toggle('sortByName')}
        />
        {grid.sortByName && (
          <InputField
            label='Order'
            as={Select}
            options={{
              value: grid.sortOrientation,
              onChange: setOrientation,
              className: 'select-small',
            }}>
            <SelectOption value='horizontal'>Horizontally</SelectOption>
            <SelectOption value='vertical'>Vertically</SelectOption>
          </InputField>
        )}
        <Checkbox
          label='Group items into Frame'
          value={Boolean(grid.groupResult)}
          onChange={toggle('groupResult')}
        />
        {grid.groupResult && (
          <InputField
            label='Frame Title'
            as='input'
            options={{
              className: 'input input-small',
              value: frameTitle,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setFrameTitle(e.target.value),
              placeholder: 'Optional',
            }}
          />
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

        <div className='form-group-small'>
          <InputField
            label='Axis'
            as={Select}
            options={{
              value: spacing.axis,
              onChange: updateAxis,
              className: 'select-small',
            }}>
            <SelectOption value='x'>Horizontal</SelectOption>
            <SelectOption value='y'>Vertical</SelectOption>
          </InputField>
          <InputField
            label='Mode'
            as={Select}
            options={{
              value: spacing.mode ?? 'move',
              onChange: updateMode,
              className: 'select-small',
            }}>
            <SelectOption value='move'>Move</SelectOption>
            <SelectOption value='grow'>Expand</SelectOption>
          </InputField>
          <InputField
            label='Spacing'
            as='input'
            options={{
              className: 'input input-small',
              type: 'number',
              value: String(spacing.spacing),
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                updateSpacing(e.target.value),
              placeholder: 'Distance',
            }}
          />
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
        </div>
      </TabGrid>
    </TabPanel>
  );
};

export const tabDef: TabTuple = [
  4,
  'arrange',
  'Arrange',
  'Grid and spacing tools',
  ArrangeTab,
];
