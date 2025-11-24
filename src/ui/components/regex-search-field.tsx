import React from 'react'

export interface RegexSearchFieldProperties
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'className' | 'style'> {
  label: React.ReactNode
  value?: string
  onChange?: (value: string) => void
  regex: boolean
  onRegexToggle: (v: boolean) => void
}

/** Input field with an inline toggle to enable regular expression search. */
export const RegexSearchField = React.forwardRef<HTMLInputElement, RegexSearchFieldProperties>(
  function RegexSearchField(
    { label, onChange, regex, onRegexToggle, id, value, ...properties },
    reference,
  ) {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      onChange?.(event.target.value)
    }
    const toggle = (checked: boolean): void => {
      onRegexToggle(checked)
    }
    return (
      <div style={{ marginBottom: 'var(--space-200)' }}>
        <label htmlFor={inputId} style={{ display: 'block', marginBottom: 'var(--space-50)' }}>
          {label}
        </label>
        <div className="search-input">
          <input
            id={inputId}
            ref={reference}
            value={value}
            onChange={handleChange}
            className="input"
            style={{
              flex: 1,
              height: 'var(--input-height)',
              padding: '0 var(--space-small)',
              borderRadius: 'var(--border-radius-medium)',
              border: '1px solid var(--indigo400)',
            }}
            {...properties}
          />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-50)' }}>
            <input
              type="checkbox"
              checked={regex}
              onChange={(event) => {
                toggle(event.target.checked)
              }}
            />
            <span>Regex</span>
          </label>
        </div>
      </div>
    )
  },
)
