import React from 'react';
import type { TabTuple } from './tab-definitions';

/** Dummy tab for testing auto-registration. */
export const DummyTab: React.FC = () => {
  return <div data-testid='dummy'>Dummy</div>;
};

export const tabDef: TabTuple = [
  99,
  'dummy',
  'Dummy',
  'Test only dummy tab',
  DummyTab,
];
