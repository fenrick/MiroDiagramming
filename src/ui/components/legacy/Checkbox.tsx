import React from 'react';

export type CheckboxProps = Readonly<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
    label?: string;
    value?: boolean;
    onChange?: (value: boolean) => void;
  }
>;

/**
 * Mirotone-styled checkbox component.
 *
 * Mirotone renders the checked state via a sibling `<span>` element. The span
 * also holds the visible label text so that the checkbox remains accessible
 * without additional attributes.
 */
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
  const generatedId = React.useId();
  const inputId = props.id ?? generatedId;

  return (
    <div className='form-group-small'>
      <label
        htmlFor={inputId}
        className={`toggle ${className}`.trim()}>
        <input
          id={inputId}
          type='checkbox'
          checked={value}
          onChange={handleChange}
          {...props}
        />
        {/* span enables Mirotone checkbox styling */}
        <span>{label}</span>
      </label>
    </div>
  );
}
