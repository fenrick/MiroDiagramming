import { Flex, styled, Switch as DSSwitch } from '@mirohq/design-system'
import React from 'react'

export type CheckboxProperties = Readonly<
  Omit<
    React.ComponentProps<typeof DSSwitch>,
    'checked' | 'onChecked' | 'onUnchecked' | 'style' | 'className' | 'onChange' | 'value' | 'type'
  > & { label?: string; value?: boolean; onChange?: (value: boolean) => void }
>

/**
 * Checkbox wrapper implemented using the design-system `Switch` component.
 * It exposes a boolean `value` prop and triggers `onChange` when toggled.
 */
const StyledGroup = styled(Flex, {
  marginBottom: 'var(--space-200)',
  position: 'relative',
})

export function Checkbox({
  label,
  value,
  onChange,
  id,
  ...properties
}: CheckboxProperties): React.JSX.Element {
  const handleChange = (checked: boolean): void => onChange?.(checked)
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const labelId = `${inputId}-label`

  return (
    <StyledGroup gap={200}>
      <DSSwitch
        id={inputId}
        checked={value}
        onChecked={() => handleChange(true)}
        onUnchecked={() => handleChange(false)}
        aria-labelledby={labelId}
        {...properties}
      />
      <label id={labelId} htmlFor={inputId}>
        {label}
      </label>
    </StyledGroup>
  )
}
