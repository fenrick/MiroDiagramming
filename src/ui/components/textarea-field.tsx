import { Form, Textarea, styled } from '@mirohq/design-system'
import React from 'react'

export type TextareaFieldProperties = Readonly<
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'className' | 'style'> & {
    label: React.ReactNode
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
    onValueChange?: (value: string) => void
  }
>

const StyledFormField = styled(Form.Field, {
  marginBottom: 'var(--space-200)',
  position: 'relative',
})

const StyledTextarea = styled(Textarea, {
  // DS Textarea renders an outer div and the actual textarea inside with
  // data-form-element="textarea". Target the inner element for size/resize.
  '& [data-form-element="textarea"]': {
    minHeight: '12rem',
    resize: 'vertical',
    padding: 'var(--space-xsmall) 12px var(--space-xsmall)',
    display: 'inline-block',
    scrollbarWidth: 'thin',
    boxSizing: 'border-box',
  },
})

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProperties>(
  function TextareaField(
    { label, onValueChange, onChange, id, value, defaultValue, ...properties },
    reference,
  ) {
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      onChange?.(event)
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
          {...properties}
        />
      </StyledFormField>
    )
  },
)
