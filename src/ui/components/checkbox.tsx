import React from 'react'

export type CheckboxProperties = Readonly<
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'checked' | 'onChange' | 'className' | 'style' | 'type' | 'value'
  > & { label?: string; value?: boolean; onChange?: (value: boolean) => void }
>

/**
 * Checkbox wrapper implemented using Mirotone checkbox styles.
 * It exposes a boolean `value` prop and triggers `onChange` when toggled.
 */
export function Checkbox({
  label,
  value,
  onChange,
  id,
  ...properties
}: CheckboxProperties): React.JSX.Element {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const isChecked = value ?? false

  return (
    <label
      className={`checkbox${properties.disabled ? ' miro-checkbox--disabled' : ''}`}
      style={{ marginBottom: 'var(--space-200)', position: 'relative' }}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={isChecked}
        onChange={(event) => {
          onChange?.(event.target.checked)
        }}
        {...properties}
      />
      <span>{label}</span>
    </label>
  )
}
