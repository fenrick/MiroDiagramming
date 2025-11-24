import React from 'react'

export type SelectProperties = Readonly<{
  value?: string
  onChange?: (value: string) => void
  placeholder?: React.ReactNode
  disabled?: boolean
  children?: React.ReactNode
}>

export function Select({
  value,
  onChange,
  placeholder,
  disabled,
  children,
}: SelectProperties): React.JSX.Element {
  return (
    <select
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      disabled={disabled}
      className="select"
      style={{
        width: '100%',
        height: 'var(--input-height)',
        padding: '0 var(--space-small)',
        borderRadius: 'var(--border-radius-medium)',
        border: '1px solid var(--indigo400)',
        backgroundColor: 'var(--white)',
      }}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {children}
    </select>
  )
}

export type SelectOptionProperties = Readonly<React.OptionHTMLAttributes<HTMLOptionElement>>

export function SelectOption({
  children,
  ...properties
}: SelectOptionProperties): React.JSX.Element {
  return <option {...properties}>{children}</option>
}
