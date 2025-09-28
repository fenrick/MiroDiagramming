import type React from 'react'

export type TabId =
  | 'diagrams'
  | 'tools'
  | 'size'
  | 'style'
  | 'arrange'
  | 'frames'
  | 'search'
  | 'help'
  | 'dummy'

export type TabTuple = readonly [
  order: number,
  id: TabId,
  label: string,
  instructions: string,
  Component: React.FC,
]

// No global command palette in Miro add‑ins.
