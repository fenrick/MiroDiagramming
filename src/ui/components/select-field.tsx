import React from 'react'

import { Select } from './select'

export type SelectFieldProperties = Readonly<
  Omit<React.ComponentProps<typeof Select>, 'className' | 'style' | 'onChange'> & {
    label: React.ReactNode
    onChange?: (value: string) => void
  }
>

/** Single component combining label and select control. */
export function SelectField({
  label,
  onChange,
  children,
  ...properties
}: SelectFieldProperties): React.JSX.Element {
  return (
    <div style={{ marginBottom: 'var(--space-200)', position: 'relative' }}>
      <label style={{ display: 'block', marginBottom: 'var(--space-50)' }}>{label}</label>
      <Select onChange={onChange} {...properties}>
        {children}
      </Select>
    </div>
  )
}
