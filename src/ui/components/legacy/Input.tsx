import React from 'react';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void;
}

/** Text input styled with Mirotone classes. */
export function Input({
  className = '',
  onChange,
  ...props
}: InputProps): React.JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange?.(e.target.value);
  };
  return (
    <input
      className={`input ${className}`.trim()}
      onChange={handleChange}
      {...props}
    />
  );
}
