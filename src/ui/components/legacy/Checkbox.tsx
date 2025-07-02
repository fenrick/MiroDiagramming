import React from 'react';
import { Flex } from '@mirohq/design-system';
import { Checkbox as DSCheckbox } from '@mirohq/design-system';

export type CheckboxProps = Readonly<
  Omit<
    React.ComponentProps<typeof DSCheckbox>,
    | 'checked'
    | 'onChecked'
    | 'onUnchecked'
    | 'style'
    | 'className'
    | 'onChange'
    | 'value'
    | 'type'
  > & { label?: string; value?: boolean; onChange?: (value: boolean) => void }
>;

/**
 * Checkbox wrapper bridging the legacy API to the design-system component.
 * It exposes a boolean `value` prop and triggers `onChange` when toggled.
 */
export function Checkbox({
  label,
  value,
  onChange,
  id,
  ...props
}: CheckboxProps): React.JSX.Element {
  const handleChange = (checked: boolean): void => {
    onChange?.(checked);
  };
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <Flex gap={200}>
      <DSCheckbox
        id={inputId}
        checked={value}
        onChecked={() => handleChange(true)}
        onUnchecked={() => handleChange(false)}
        {...props}
      />
      <label htmlFor={inputId}>{label}</label>
    </Flex>
  );
}
