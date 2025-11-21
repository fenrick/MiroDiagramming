import React from 'react'

export type TextareaFieldProperties = Readonly<
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'className' | 'style'> & {
    label: React.ReactNode
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
    onValueChange?: (value: string) => void
  }
>

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
      <div style={{ marginBottom: 'var(--space-200)', position: 'relative' }}>
        <label htmlFor={textareaId} style={{ display: 'block', marginBottom: 'var(--space-50)' }}>
          {label}
        </label>
        <textarea
          id={textareaId}
          ref={reference}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className="textarea"
          style={{
            width: '100%',
            minHeight: '12rem',
            resize: 'vertical',
            padding: 'var(--space-xsmall) 12px var(--space-xsmall)',
            borderRadius: 'var(--border-radius-medium)',
            border: '1px solid var(--indigo400)',
            boxSizing: 'border-box',
          }}
          {...properties}
        />
      </div>
    )
  },
)
