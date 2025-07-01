import React from 'react';
import { Select, SelectOption, InputField } from '../components/legacy';
import { TabGrid } from '../components/TabGrid';
import { DiagramTab } from './DiagramTab';
import { CardsTab } from './CardsTab';
import { TabPanel } from '../components/TabPanel';
import type { TabTuple } from './tab-definitions';

/**
 * Allows users to choose between diagram or cards import.
 */
export const CreateTab: React.FC = () => {
  const [mode, setMode] = React.useState<'diagram' | 'cards'>('diagram');
  return (
    <TabPanel tabId='create'>
      <TabGrid columns={2}>
        <InputField label='Create mode'>
          <Select
            value={mode}
            onChange={(v) => setMode(v as 'diagram' | 'cards')}
            className='select-small'>
            <SelectOption value='diagram'>Diagram</SelectOption>
            <SelectOption value='cards'>Cards</SelectOption>
          </Select>
        </InputField>
        {mode === 'diagram' ? <DiagramTab /> : <CardsTab />}
      </TabGrid>
    </TabPanel>
  );
};

export const tabDef: TabTuple = [
  1,
  'create',
  'Create',
  'Import diagrams or cards from JSON',
  CreateTab,
];
