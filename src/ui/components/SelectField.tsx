import { Form, styled } from '@mirohq/design-system'
import React from 'react'

import { Select } from './Select'

export type SelectFieldProps = Readonly<
  Omit<React.ComponentProps<typeof Select>, 'className' | 'style' | 'onChange'> & {
    /** Visible label text. */
    label: React.ReactNode
    /** Change handler returning the selected value. */
    onChange?: (value: string) => void
  }
>

/** Single component combining label and select control. */
const StyledFormField = styled(Form.Field, {
  marginBottom: 'var(--space-200)',
  position: 'relative',
})

const StyledLabel = styled(Form.Label, { marginBottom: 'var(--space-xsmall)' })

const StyledSelect = styled(Select, {
  paddingLeft: 'var(--space-small)',
  paddingRight: 'var(--space-small)',
})

export function SelectField({
  label,
  onChange,
  children,
  ...properties
}: SelectFieldProps): React.JSX.Element {
  const handleChange = (value: string): void => onChange?.(value)

  return (
    <StyledFormField>
      <StyledLabel>{label}</StyledLabel>
      <StyledSelect onChange={handleChange} {...properties}>
        {children}
      </StyledSelect>
    </StyledFormField>
  )
}
