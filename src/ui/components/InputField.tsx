import React from 'react';
import { Form, Input, Primitive } from '@mirohq/design-system';

export type InputFieldProps = Readonly<{
  /** Visible label text. */
  label: React.ReactNode;
  /** Component used for the control. Defaults to `Input`. */
  as?: React.ElementType;
  /** Props forwarded to the rendered control component. */
  options?: Record<string, unknown>;
  /** Change handler returning the input value. */
  onChange?: (value: string) => void;
  /** Optional control children, e.g. `<SelectOption>` elements. */
  children?: React.ReactNode;
  /** Optional id forwarded to the control and label. */
  id?: string;
  type?: string;
  value: string;
}>;

// Custom class names and inline styles are intentionally excluded so spacing
// and typography remain consistent across the app.

/** Single component combining label and input control. */
export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    {
      label,
      as: Component = Input,
      options = {},
      onChange,
      children,
      id,
      type,
      value,
    },
    ref,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const handleChange = (valueOrEvent: unknown): void => {
      const opts = options as { onChange?: (arg: unknown) => void };
      opts.onChange?.(valueOrEvent);
      if (typeof valueOrEvent === 'string') {
        onChange?.(valueOrEvent);
      } else if (
        valueOrEvent &&
        typeof (valueOrEvent as { target?: { value?: string } }).target
          ?.value === 'string'
      ) {
        onChange?.(
          (valueOrEvent as { target: { value: string } }).target.value,
        );
      }
    };

    return (
      <Form.Field>
        <Form.Label htmlFor={inputId}>{label}</Form.Label>
        <Input
          id={inputId}
          onChange={handleChange}
          type={type}
          value={value}>
          {children}
        </Input>
      </Form.Field>
    );
    /**
        {React.createElement(
          Component,
          { id: inputId, ref, ...options, onChange: handleChange },
          children,
        )} */
  },
);
