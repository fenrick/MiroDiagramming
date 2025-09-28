import { Form, Input, styled } from '@mirohq/design-system'
import React from 'react'

export type InputFieldProperties = Readonly<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'className' | 'style'> & {
    /** Visible label text. */
    label: React.ReactNode
    /**
     * Callback fired when the input value changes. This receives the raw
     * string value extracted from the event.
     */
    onValueChange?: (value: string) => void
  }
>

// Custom class names and inline styles are intentionally excluded so spacing
// and typography remain consistent across the app.

const StyledFormField = styled(Form.Field, {
  marginBottom: 'var(--space-200)',
  position: 'relative',
})

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProperties>(
  function InputField({ label, onValueChange, id, ...properties }, reference) {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const { onChange: externalOnChange, ...restProperties } = properties as React.ComponentProps<
      typeof Input
    >
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      externalOnChange?.(event)
      onValueChange?.(event.target.value)
    }

    return (
      <StyledFormField>
        <Form.Label htmlFor={inputId}>{label}</Form.Label>
        <Input id={inputId} ref={reference} onChange={handleChange} {...restProperties} />
      </StyledFormField>
    )
  },
)
