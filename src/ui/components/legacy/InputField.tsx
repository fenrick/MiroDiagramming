import React from 'react';

export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Visible label text. */
  label: React.ReactNode;
  /** Optional custom form control. If omitted, a text input is rendered. */
  children?: React.ReactNode;
  /** Class applied to the surrounding label element. */
  wrapperClassName?: string;
  /** Change handler returning the input value. */
  onChange?: (value: string) => void;
}

/** Single component combining label and input control. */
export function InputField({
  label,
  children,
  wrapperClassName = '',
  className = '',
  onChange,
  id,
  ...props
}: InputFieldProps): React.JSX.Element {
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
    control = React.cloneElement(
      children as React.ReactElement,
      {
        id: inputId,
        onChange: (e: React.ChangeEvent<HTMLInputElement>): void => {
          (
            children.props as {
              onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
            }
          ).onChange?.(e);
          handleChange(e);
        },
      } as Partial<React.ComponentProps<'input'>>,
    );
  } else if (children) {
    control = children;
  } else {
    control = (
      <input
        id={inputId}
        className={`input ${className}`.trim()}
        onChange={handleChange}
        {...props}
      />
    );
  }

  return (
    <div className='form-group-small'>
      <label
        htmlFor={inputId}
        className={wrapperClassName}>
        {label}
      </label>
      {control}
    </div>
  );
}
