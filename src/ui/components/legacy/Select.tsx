import React from 'react';

export interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'onChange' | 'value'
  > {
  value?: string;
  onChange?: (value: string) => void;
}

/** Select dropdown styled with Mirotone classes. */
export function Select({
  className = '',
  onChange,
  children,
  ...props
}: SelectProps): React.JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    onChange?.(e.target.value);
  };
  return (
    <div className='form-group-small'>
      <select
        className={`select ${className}`.trim()}
        onChange={handleChange}
        {...props}>
        {children}
      </select>
    </div>
  );
}

export type SelectOptionProps = React.OptionHTMLAttributes<HTMLOptionElement>;

/** Option element for Select. */
export function SelectOption(props: SelectOptionProps): React.JSX.Element {
  return <option {...props} />;
}
