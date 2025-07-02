import React from 'react';
import { Form, Input } from '@mirohq/design-system';

export type InputFieldProps = Readonly<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    /** Visible label text. */
    label: React.ReactNode;
    /** Optional custom form control. If omitted, a text input is rendered. */
    children?: React.ReactNode;
    /** Change handler returning the input value. */
    onChange?: (value: string) => void;
  }
>;

/** Single component combining label and input control. */
export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField({ label, children, onChange, id, ...props }, ref) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      onChange?.(e.target.value);
    };
    let control: React.ReactNode;
    if (
      children &&
      React.isValidElement(children) &&
      children.type !== React.Fragment
    ) {
      control = React.cloneElement(children as React.ReactElement, {
        id: inputId,
        onChange: (e: React.ChangeEvent<HTMLInputElement>): void => {
          (
            children.props as {
              onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
            }
          ).onChange?.(e);
          handleChange(e);
        },
      });
    } else if (children) {
      control = children;
    } else {
      control = (
        <Input
          id={inputId}
          onChange={handleChange}
          ref={ref}
          {...(props as React.ComponentProps<typeof Input>)}
        />
      );
    }

    return (
      <Form.Field>
        <Form.Label htmlFor={inputId}>{label}</Form.Label>
        {control}
      </Form.Field>
    );
  },
);
