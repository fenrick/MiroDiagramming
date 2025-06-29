import React from 'react';
import { Heading } from '../components/legacy';
import type { TabTuple } from './tab-definitions';

import changelog from '../../../CHANGELOG.md?raw';

/** Displays the project changelog for reference. */
export const ChangelogTab: React.FC = () => (
  <div data-testid='changelog-tab'>
    <Heading level={3}>Changelog</Heading>
    <pre style={{ whiteSpace: 'pre-wrap' }}>{changelog}</pre>
  </div>
);

export const tabDef: TabTuple = [
  7,
  'changelog',
  'Changelog',
  'Recent changes and release notes',
  ChangelogTab,
];
