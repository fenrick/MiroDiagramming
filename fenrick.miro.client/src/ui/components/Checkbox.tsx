import { styled } from "@mirohq/design-system";
import React from "react";

export type CheckboxProps = Readonly<
  Omit<
    React.ComponentProps<typeof DSSwitch>,
    | "checked"
    | "onChecked"
    | "onUnchecked"
    | "style"
    | "className"
    | "onChange"
    | "value"
    | "type"
  > & { label?: string; value?: boolean; onChange?: (value: boolean) => void }
>;

/**
 * Checkbox wrapper implemented using the design-system `Switch` component.
 * It exposes a boolean `value` prop and triggers `onChange` when toggled.
 */
const StyledGroup = styled(Flex,
  {
    marginBottom: "16px",
    position: "relative",
  });

export function Checkbox({
  label,
  value,
  onChange,
  id,
  ...props
}: CheckboxProps): React.JSX.Element {
  const handleChange = (checked: boolean): void => onChange?.(checked);
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const labelId = `${inputId}-label`;

  return (
    <StyledGroup gap={200}>
      <DSSwitch
        id={inputId}
        checked={value}
        onChecked={() => handleChange(true)}
        onUnchecked={() => handleChange(false)}
        aria-labelledby={labelId}
        {...props}/>
      <label
        id={labelId}
        htmlFor={inputId}>
        {label}
      </label>
    </StyledGroup>
  );
}
