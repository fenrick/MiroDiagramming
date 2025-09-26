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

export interface CommandDef {
  /** Unique identifier used for keyboard shortcuts. */
  id: string
  /** Visible label for menus. */
  label: string
  /** Shortcut string for documentation. */
  shortcut: string
}

/** List of global commands available in the app. */
export const COMMANDS: CommandDef[] = [
  { id: 'command-palette', label: 'Command Palette', shortcut: 'Ctrl+K' },
]
