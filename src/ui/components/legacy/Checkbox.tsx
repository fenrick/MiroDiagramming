import React from 'react';

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  label?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
}

/** Checkbox with label styled using Mirotone classes. */
export function Checkbox({
  label,
  value,
  onChange,
  className = '',
  ...props
}: CheckboxProps): React.JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange?.(e.target.checked);
  };
  return (
    <label className={`checkbox ${className}`.trim()}>
      <input
        type='checkbox'
        checked={value}
        onChange={handleChange}
        {...props}
      />
      {/* span enables Mirotone checkbox styling */}
      <span>{label}</span>
    </label>
  );
}
