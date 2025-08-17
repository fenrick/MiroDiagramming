import { Form, Input } from '@mirohq/design-system';
import React from 'react';

export type InputFieldProps = Readonly<
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'className' | 'style'
  > & {
    /** Visible label text. */
    label: React.ReactNode;
    /**
     * Callback fired when the input value changes. This receives the raw
     * string value extracted from the event.
     */
    onValueChange?: (value: string) => void;
  }
>;

// Custom class names and inline styles are intentionally excluded so spacing
// and typography remain consistent across the app.

/** Single component combining label and input control. */

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField({ label, onValueChange, id, ...props }, ref) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const { onChange: externalOnChange, ...restProps } =
      props as React.ComponentProps<typeof Input>;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      externalOnChange?.(e);
      onValueChange?.(e.target.value);
    };

    return (
      <Form.Field>
        <Form.Label htmlFor={inputId}>{label}</Form.Label>
        <Input
          id={inputId}
          ref={ref}
          onChange={handleChange}
          {...restProps}
        />
      </Form.Field>
    );
  },
);
