import React from 'react';
import { Flex, Switch as DSSwitch } from '@mirohq/design-system';

export type CheckboxProps = Readonly<
  Omit<
    React.ComponentProps<typeof DSSwitch>,
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
 * Checkbox wrapper implemented using the design-system `Switch` component.
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
      <DSSwitch
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
