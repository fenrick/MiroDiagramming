import React from 'react';
import { Select, SelectOption, InputLabel } from '../components/legacy';
import { DiagramTab } from './DiagramTab';
import { CardsTab } from './CardsTab';
import type { TabTuple } from './tab-definitions';

/**
 * Allows users to choose between diagram or cards import.
 */
export const CreateTab: React.FC = () => {
  const [mode, setMode] = React.useState<'diagram' | 'cards'>('diagram');
  return (
    <div>
      <InputLabel>
        Create mode
        <Select value={mode} onChange={v => setMode(v as 'diagram' | 'cards')}>
          <SelectOption value='diagram'>Diagram</SelectOption>
          <SelectOption value='cards'>Cards</SelectOption>
        </Select>
      </InputLabel>
      {mode === 'diagram' ? <DiagramTab /> : <CardsTab />}
    </div>
  );
};

export const tabDef: TabTuple = [
  1,
  'create',
  'Create',
  'Import diagrams or cards from JSON',
  CreateTab,
];
