import React from 'react';
import { Form } from '@mirohq/design-system';
import { Select } from './Select';

export type SelectFieldProps = Readonly<
  Omit<
    React.ComponentProps<typeof Select>,
    'className' | 'style' | 'onChange'
  > & {
    /** Visible label text. */
    label: React.ReactNode;
    /** Change handler returning the selected value. */
    onChange?: (value: string) => void;
  }
>;

/** Single component combining label and select control. */
export function SelectField({
  label,
  onChange,
  children,
  ...props
}: SelectFieldProps): React.JSX.Element {
  const handleChange = (value: string): void => {
    onChange?.(value);
  };

  return (
    <Form.Field>
      <Form.Label>{label}</Form.Label>
      <Select
        onChange={handleChange}
        {...props}>
        {children}
      </Select>
    </Form.Field>
  );
}
