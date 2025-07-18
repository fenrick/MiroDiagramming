import React from 'react';
import { Form, Input, Switch } from '@mirohq/design-system';

export interface RegexSearchFieldProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  /** Visible label text. */
  label: React.ReactNode;
  /** Current search text. */
  value?: string;
  /** Change handler returning the input value. */
  onChange?: (value: string) => void;
  /** Whether the query should be treated as a regular expression. */
  regex: boolean;
  /** Handler toggling regex mode. */
  onRegexToggle: (v: boolean) => void;
}

/**
 * Input field with an inline toggle to enable regular expression search.
 */
export const RegexSearchField = React.forwardRef<
  HTMLInputElement,
  RegexSearchFieldProps
>(function RegexSearchField(
  { label, onChange, regex, onRegexToggle, id, value, ...props },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    onChange?.(e.target.value);
  const toggle = (checked: boolean): void => onRegexToggle(checked);
  return (
    <Form.Field>
      <Form.Label htmlFor={inputId}>{label}</Form.Label>
      <div className='search-input'>
        <Input
          id={inputId}
          ref={ref}
          value={value}
          onChange={handleChange}
          {...(props as React.ComponentProps<typeof Input>)}
        />
        <Switch
          aria-label='Regex'
          checked={regex}
          onChecked={() => toggle(true)}
          onUnchecked={() => toggle(false)}
        />
      </div>
    </Form.Field>
  );
});
