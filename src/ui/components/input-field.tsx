import React from 'react'

export type InputFieldProperties = Readonly<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'className' | 'style'> & {
    /** Visible label text. */
    label: React.ReactNode
    /**
     * Optional native change handler invoked before {@link onValueChange}.
     */
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    /**
     * Callback fired when the input value changes. This receives the raw
     * string value extracted from the event.
     */
    onValueChange?: (value: string) => void
  }
>

// Custom class names and inline styles are intentionally excluded so spacing
// and typography remain consistent across the app.

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProperties>(
  function InputField({ label, onValueChange, onChange, id, ...properties }, reference) {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      onChange?.(event)
      onValueChange?.(event.target.value)
    }

    return (
      <div style={{ marginBottom: 'var(--space-200)', position: 'relative' }}>
        <label htmlFor={inputId} style={{ display: 'block', marginBottom: 'var(--space-50)' }}>
          {label}
        </label>
        <input
          id={inputId}
          ref={reference}
          onChange={handleChange}
          className="input"
          style={{
            width: '100%',
            height: 'var(--input-height)',
            padding: '0 var(--space-small)',
            borderRadius: 'var(--border-radius-medium)',
            border: '1px solid var(--indigo400)',
          }}
          {...properties}
        />
      </div>
    )
  },
)
