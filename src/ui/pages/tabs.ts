import type { TabTuple, TabId } from './tab-definitions';
const modules = import.meta.glob<{ tabDef: TabTuple }>('./*Tab.tsx', {
  eager: true,
});

export const TAB_DATA: TabTuple[] = Object.values(modules)
  .filter((m): m is { tabDef: TabTuple } => 'tabDef' in m)
  .map(m => m.tabDef)
  .sort((a, b) => a[0] - b[0]);

export type Tab = TabId;
export type { TabTuple } from './tab-definitions';
