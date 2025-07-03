import React from 'react';
import { Form, Input } from '@mirohq/design-system';

export type InputFieldProps = Readonly<
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'className' | 'style'
  > & {
    /** Visible label text. */
    label: React.ReactNode;
    /** Change handler returning the input value. */
    onChange?: (value: string) => void;
  }
>;

// Custom class names and inline styles are intentionally excluded so spacing
// and typography remain consistent across the app.

/** Single component combining label and input control. */
export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField({ label, onChange, id, ...props }, ref) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      onChange?.(e.target.value);
    };

    return (
      <Form.Field>
        <Form.Label htmlFor={inputId}>{label}</Form.Label>
        <Input
          id={inputId}
          ref={ref}
          onChange={handleChange}
          {...(props as React.ComponentProps<typeof Input>)}
        />
      </Form.Field>
    );
  },
);
