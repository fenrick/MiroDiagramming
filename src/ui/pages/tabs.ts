import type { TabTuple, TabId } from './tab-definitions';
const modules = import.meta.glob<{ tabDef: TabTuple }>('./*Tab.tsx', {
  eager: true,
});

/**
 * Auto registers all sidebar tabs. Dummy tab appears only in test mode to
 * avoid leaking internal helpers into development or production builds.
 */
export const TAB_DATA: TabTuple[] = Object.values(modules)
  .filter((m): m is { tabDef: TabTuple } => 'tabDef' in m)
  .map((m) => m.tabDef)
  .filter((t) =>
    process.env.NODE_ENV === 'test'
      ? true
      : t[1] !== 'dummy' &&
        !['size', 'style', 'arrange', 'frames'].includes(t[1]),
  )
  .sort((a, b) => a[0] - b[0]);

export type Tab = TabId;
export type { TabTuple } from './tab-definitions';
