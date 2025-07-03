import React from 'react';
import { Form, Input, styled } from '@mirohq/design-system';

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
const StyledFormField = styled(Form.Field, {
  marginBottom: '16px',
  position: 'relative',
});

const StyledLabel = styled(Form.Label, { marginBottom: 'var(--space-xsmall)' });

const StyledInput = styled(Input, {
  paddingLeft: 'var(--space-small)',
  paddingRight: 'var(--space-small)',
});

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField({ label, onChange, id, ...props }, ref) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const { onChange: extraOnChange, ...restProps } =
      props as React.ComponentProps<typeof Input>;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      extraOnChange?.(e);
      onChange?.(e.target.value);
    };

    return (
      <StyledFormField>
        <StyledLabel htmlFor={inputId}>{label}</StyledLabel>
        <StyledInput
          id={inputId}
          ref={ref}
          onChange={handleChange}
          {...restProps}
        />
      </StyledFormField>
    );
  },
);
