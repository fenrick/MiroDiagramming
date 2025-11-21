import React from 'react'

export type FormGroupProperties = Readonly<{
  children: React.ReactNode
  style?: React.CSSProperties
}>

/**
 * Wrapper for grouping related form fields with consistent vertical spacing.
 */
export function FormGroup({ children, style }: FormGroupProperties): React.JSX.Element {
  return <div style={{ marginBottom: 'var(--space-200)', ...style }}>{children}</div>
}
