import type React from 'react';

export type TabId =
  | 'create'
  | 'resize'
  | 'style'
  | 'grid'
  | 'frames'
  | 'spacing'
  | 'excel'
  | 'dummy';

export type TabTuple = readonly [
  order: number,
  id: TabId,
  label: string,
  instructions: string,
  Component: React.FC,
];
