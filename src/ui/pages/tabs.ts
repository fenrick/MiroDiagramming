import type { TabId, TabTuple } from './tab-definitions'

const modules = import.meta.glob<{ tabDefinition: TabTuple }>('./*-tab.tsx', {
  eager: true,
})

/**
 * Auto registers all sidebar tabs. Dummy tab appears only in test mode to
 * avoid leaking internal helpers into development or production builds.
 */
export const TAB_DATA: TabTuple[] = Object.values(modules)
  .filter((m): m is { tabDefinition: TabTuple } => 'tabDefinition' in m)
  .map((m) => m.tabDefinition)
  .filter((t) =>
    process.env.NODE_ENV === 'test'
      ? true
      : t[1] !== 'dummy' && !['size', 'style', 'arrange', 'frames'].includes(t[1]),
  )
  .toSorted((a, b) => a[0] - b[0])

export type Tab = TabId
export type { TabTuple } from './tab-definitions'
