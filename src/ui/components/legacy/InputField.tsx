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
  ...props
}: InputFieldProps): React.JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange?.(e.target.value);
  };
  return (
    <div className='form-group'>
      <label className={wrapperClassName}>{label}</label>
      {children ?? (
        <input
          className={`input ${className}`.trim()}
          onChange={handleChange}
          {...props}
        />
      )}
    </div>
  );
}
