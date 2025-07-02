import React from 'react';
import { Flex } from '@mirohq/design-system';
import { Checkbox as DSCheckbox } from '@mirohq/design-system';

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
  ...props
}: CheckboxProps): React.JSX.Element {
  const handleChange = (e: React.FormEvent<HTMLButtonElement>): void => {
    onChange?.((e.currentTarget as HTMLButtonElement).ariaPressed === 'true');
  };
  const generatedId = React.useId();
  const inputId = props.id ?? generatedId;

  return (
    <Flex gap={200}>
      <DSCheckbox
        id={inputId}
        checked={value}
        onChange={handleChange}
      />
      <label htmlFor={inputId}>{label}</label>
    </Flex>
  );
}
