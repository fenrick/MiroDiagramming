import type { TabTuple, TabId } from './tab-definitions';
import { createTabDef } from './CreateTab';
import { resizeTabDef } from './ResizeTab';
import { styleTabDef } from './StyleTab';
import { gridTabDef } from './GridTab';
import { spacingTabDef } from './SpacingTab';

export const TAB_DATA: TabTuple[] = [
  createTabDef,
  resizeTabDef,
  styleTabDef,
  gridTabDef,
  spacingTabDef,
].sort((a, b) => a[0] - b[0]);

export type Tab = TabId;
export type { TabTuple } from './tab-definitions';
