import { Form, Textarea, styled } from '@mirohq/design-system'
import React from 'react'

export type TextareaFieldProperties = Readonly<
  Omit<React.ComponentProps<typeof Textarea>, 'onChange' | 'className' | 'style'> & {
    label: React.ReactNode
    onValueChange?: (value: string) => void
  }
>

const StyledFormField = styled(Form.Field, {
  marginBottom: 'var(--space-200)',
  position: 'relative',
})

const StyledTextarea = styled(Textarea, {
  width: '100%',
  minHeight: '12rem',
  resize: 'vertical',
})

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProperties>(
  function TextareaField(
    { label, onValueChange, id, value, defaultValue, ...properties },
    reference,
  ) {
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    const { onChange: externalOnChange, ...restProperties } = properties as React.ComponentProps<
      typeof Textarea
    >
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      externalOnChange?.(event)
      onValueChange?.(event.target.value)
    }

    return (
      <StyledFormField>
        <Form.Label htmlFor={textareaId}>{label}</Form.Label>
        <StyledTextarea
          id={textareaId}
          ref={reference}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          {...restProperties}
        />
      </StyledFormField>
    )
  },
)
